import { ObjectId } from 'mongodb';
import fs from 'fs';
import { uuid } from 'uuidv4';
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
    console.log(`The parentId id ${parentId} and the isPublic is ${isPublic}`);
    if (parentId !== '0') {
      const parent = dbClient.getData({ _id: ObjectId(parentId) }, 'files');
      if (parent === null) {
        res.status(400).json({
          error: 'Parent not found',
        }).end();
        return { error: 'Parent not found' };
      } if (parent.type !== 'folder') {
        res.status(400).json({
          error: 'Parent is not a folder',
        }).end();
        return { error: 'Parent is not a folder' };
      }
    } else if (type === 'folder') {
      const key = {
        userId, name, type, parentId,
      };
      const id = await dbClient.saveFile(key);
      res.status(201).json({
        id, userId: ObjectId(userId), name, type, isPublic, parentId,
      }).end();
      return {
        id, userId, name, type, isPublic, parentId,
      };
    }
    // Get the folder path and the converted data given
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const clearData = decoder.dataDecoder(data);
    // check if the folder exists else create it
    fs.stat(folderPath, (err, stat) => {
      if (err || stat.isFile()) { fs.mkdirSync(folderPath); }
    });
    // create a path to store the data
    const filePath = `${folderPath}/${uuid()}`;
    const writeFile = fs.createWriteStream(filePath);
    writeFile.write(clearData);
    writeFile.end();
    const localPath = path.resolve(filePath);
    const fileId = await dbClient.saveFile({
      userId, name, type, isPublic, parentId, localPath,
    });
    res.status(201).json({
      id: fileId,
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId,
    }).end();
    return ({
      fileId, userId, name, type, isPublic, parentId,
    });
  },
};

export default FilesController;
