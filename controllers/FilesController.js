import { ObjectId } from 'mongodb';
import fs from 'fs';
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
      res.status(401).json({ error: 'Unauthorized' }).end();
      return { error: 'Unauthorized' };
    }
    // Declare the accpted types
    const typeVar = ['folder', 'file', 'image'];
    // Get the name and type from the request body
    const { name, type, data } = req.body;
    if (name === undefined) {
      res.status(400).json({
        error: 'Missing name',
      }).end();
      return { error: 'Missing name' };
    } if (type === undefined || !typeVar.includes(type)) {
      res.status(400).json({
        error: 'Missing type',
      }).end();
      return { error: 'Missing type' };
    } if (type !== 'folder' && (data === undefined)) {
      res.status(400).json({
        error: 'Missing data',
      }).end();
      return { error: 'Missing data' };
    }
    // Define the parent id and the is public variables
    let { parentId } = req.body;
    let { isPublic } = req.body;
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
      const key = {
        userId, name, type, parentId,
      };
      const id = await dbClient.saveFile(key);
      return res.status(201).json({
        id, userId: ObjectId(userId), name, type, isPublic, parentId,
      }).end();
    }
    // Get the folder path and the converted data given
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const clearData = decoder.dataDecoder(data);
    // check if the folder exists else create it
    fs.stat(folderPath, (err, stat) => {
      if (err || stat.isFile()) { fs.mkdirSync(folderPath); }
    });
    // create a path to store the data
    const filePath = `${folderPath}/${v4()}`;
    const writeFile = fs.createWriteStream(filePath);
    writeFile.write(clearData);
    writeFile.end();
    const localPath = path.resolve(filePath);
    const fileId = await dbClient.saveFile({
      userId, name, type, isPublic, parentId, localPath,
    });
    return res.status(201).json({
      id: fileId,
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId,
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
