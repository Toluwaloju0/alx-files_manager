import { ObjectId } from 'mongodb';
import { v4 } from 'uuid';
import fs from 'fs/promises';
import uuid from 'uuid'
import path from 'path';
import decoder from '../utils/decoder';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FilesController = {
  async postUpload(req, res) {
    // The endpoint for creating a new file in db
    // Check if the user exists before creating a file
    const token = req.get('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.getData({ _id: ObjectId(userId) });
    if (user === null) {
      return res.status(401).json({
        error: 'Unauthorized',
      }).end();
    }
    // Get all the required data from the req body and define accepted types
    const {
      name, type, data,
    } = req.body;
    const types = ['folder', 'file', 'image'];
    if (name === undefined) {
      return res.status(400).json({
        error: 'Missing name',
      }).end();
    } if (type === undefined || !types.includes(type)) {
      return res.status(400).json({
        error: 'Missing type',
      }).end();
    } if (type !== 'folder' && data === undefined) {
      return res.status(400).json({
        error: 'Missing data',
      }).end();
    }
    // Set the parentId and isPublic variables if they are undefined
    let { parentId, isPublic } = req.body;
    if (parentId === undefined) { parentId = 0; }
    if (isPublic === undefined) { isPublic = false; }
    const root = process.env.FOLDER_PATH || '/tmp/files_manager';
    let path;

    if (parentId !== 0) {
      // get the parent from the database
      const parent = await dbClient.getData({ _id: ObjectId(parentId) }, 'files');
      if (parent === null) {
        return res.status(400).json({
          error: 'Parent not found',
        }).end();
      } if (parent.type !== 'folder') {
        return res.status(400).json({
          error: 'Parent is not a folder',
        }).end();
      }
      path = `${root}/${parentId}`;
    } else {path = `${root}`}
    // Create a variable to store all keys which will be added to DB
    const keys = {
      userId, name, type, parentId, isPublic,
    };
    // create the folder if it doesnt exists
    // await fs.mkdir(path, { recursive: true });
    // if (type !== 'folder') {
    //   // Get the path to the folder to store all files and create it
    //   const folder = process.env.FOLDER_PATH || '/tmp/files_manager';
    //   const fileName = `${folder}/${v4()}`;
    //   await fs.writeFile(fileName, decoder.dataDecoder(data), { mode: 0o666, flag: 'w' });
    //   keys.localPath = await path.resolve(fileName);
    // }
    const file = await dbClient.saveFile(keys);
    return res.status(201).json(file).end();
  },
  // async getShow(req, res) {
  // Get the id from the parameters in the URL
  // const fileId = req.param.id;
  // const userId = await redisClient.get(req.get('X-token'));
  // // retrieve the user based on the token
  // const user = dbClient.getData({ _id: ObjectId(userId) });
  // if (user === null) {
  //   res.status(400).json({
  //     error: 'Unauthorized',
  //   }).end();
  //   return;
  // }
  // const file = dbClient.getData({ _id: ObjectId(fileId), userId: ObjectId(userId) }, 'files');
  // if (file === null) {
  //   res.status(404).json({
  //     error: 'Not found',
  //   }).end();
  // } else {
  //   res.json(file).end();
  // }d, name, type, isPublic, parentId,
  // }).end();
  // },

  // The route for the GET /file/:id

  // },

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
