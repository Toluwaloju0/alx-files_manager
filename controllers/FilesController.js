import { ObjectId } from 'mongodb';
import { readFileAsync } from 'process';
import decoder from '../utils/decoder';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FilesController = {
  async postUpload(req, res) {
    // Get the token and retrieve the user id using redis client
    const token = req.get('X-token');
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.getUser({ _id: ObjectId(userId) });
    if (user === null) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return { error: 'Unauthorized' };
    }
    // Declare the accpted types
    const typeVar = ['folder', 'file', 'image'];
    // Get the name and type from the request body
    const { name, type, data } = req.body;
    if (name === null || name === undefined) {
      res.status(400).json({
        error: 'Missing name',
      }).end();
      return { error: 'Missing name' };
    } if (type === null || type === undefined || !typeVar.includes(type)) {
      res.status(400).json({
        error: 'Missing type',
      }).end();
      return { error: 'Missing type' };
    } if (type !== 'folder' && (data === null || data === undefined)) {
      res.status(400).json({
        error: 'Missing data',
      }).end();
      return { error: 'Missing data' };
    }
    // Define the parent id and the is public variables
    const { parentId } = req.body || 0;
    const { isPublic } = req.body || false;
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
        id, userId, name, type, isPublic, parentId,
      }).end();
    } else {
      // Get the folder path and the converted data given
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const clearData = decoder.dataDecoder(data);
    }
  },
};

export default FilesController;
