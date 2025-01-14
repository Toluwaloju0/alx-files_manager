import { ObjectId } from 'mongodb';
import fs from 'fs/promises';
import { v4 } from 'uuid';
import path from 'path';
import decoder from '../utils/decoder';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FilesController = {
  async postUpload(req, res) {
    // Get the token and retrieve the user id using redis client
    const token = req.get('X-token');
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.getData({ _id: ObjectId(userId) });
    if (user === null) {
      return res.status(401).json({ error: 'Unauthorized' }).end();
    }
    // Declare the accpted types
    const typeVar = ['folder', 'file', 'image'];
    // Get the name and type from the request body
    const { name, type, data } = req.body;
    if (name === undefined) {
      return res.status(400).json({
        error: 'Missing name',
      }).end();
    } if (type === undefined || !typeVar.includes(type)) {
      return res.status(400).json({
        error: 'Missing type',
      }).end();
    } if (type !== 'folder' && data === undefined) {
      return res.status(400).json({
        error: 'Missing data',
      }).end();
    }
    // Define the parent id and the is public variables
    let { parentId, isPublic } = req.body;
    if (parentId === undefined) { parentId = '0'; }
    if (isPublic === undefined) { isPublic = false; }
    if (parentId !== '0') {
      const parent = dbClient.getData({ _id: ObjectId(parentId) }, 'files');
      if (parent === null) {
        return res.status(400).json({
          error: 'Parent not found',
        }).end();
      } if (parent.type !== 'folder') {
        return res.status(400).json({
          error: 'Parent is not a folder',
        }).end();
      }
    } else if (type === 'folder') {
      const id = await dbClient.saveFile({
        userId, name, type, parentId,
      });
      return res.status(201).json({
        id, userId, name, type, isPublic, parentId,
      }).end();
    }
    // Get the folder path and the converted data given
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    // check if the folder exists else create it
    await fs.mkdir(folderPath, { recursive: true });
    // create a write stream and store the data in clear
    const filePath = `${folderPath}/${v4()}`;
    await fs.writeFile(filePath, decoder.dataDecoder(data), { mode: 0o666, flag: 'w' });
    const localPath = path.resolve(filePath);
    // Store the file in db
    const id = await dbClient.saveFile({
      userId, name, type, isPublic, parentId, localPath,
    });
    return res.status(201).json({
      id, userId, name, type, isPublic, parentId,
    }).end();
  },

  // The route for the GET /file/:id
  async getShow(req, res) {
    // Get the id from the parameters in the URL
    const fileId = req.param.id;
    const userId = await redisClient.get(req.get('X-token'));
    // retrieve the user based on the token
    const user = dbClient.getData({ _id: ObjectId(userId) });
    if (user === null) {
      res.status(400).json({
        error: 'Unauthorized',
      }).end();
      return;
    }
    const file = dbClient.getData({ _id: ObjectId(fileId), userId: ObjectId(userId) }, 'files');
    if (file === null) {
      res.status(404).json({
        error: 'Not found',
      }).end();
    } else {
      res.json(file).end();
    }
  },

  // Route for the //files endpoint
  // getIndex(req, res) {
  //   // Get the user from the token
  //   const userId = req.get('X-token');
  //   const user = dbClient.get({_id: ObjectId(userId)});
  //   if (user === null) {
  //     res.status(400).json({
  //       error: 'Unauthorized'
  //     }).end();
  //     return;
  //   }
  //   const keys = {
  //     @facet: {}
  //   }
  //   const { parentId, page } = req.body;
  //   if (parentId) {key['parentId'] = ObjectId(parentId)}

  // }
};

export default FilesController;
