import { v4 } from 'uuid';
import { ObjectId } from 'mongodb';
import decoder from '../utils/decoder';
import hashPassword from '../utils/hashPwd';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AuthController = {
  async getConnect(req, res) {
    // Get the basic auth stringet the and convert it, get the token
    const Auth = req.get('Authorization').split(' ');
    const decoded = decoder.stringDecoder(Auth[1]);
    const token = String(v4());

    // Get the user from db client
    const user = await dbClient.getData({ email: decoded[0] });
    if (user === null || hashPassword(decoded[1]) !== user.password) {
      res.status(401).json({
        error: 'Unauthorized',
      }).end();
    } else {
      await redisClient.set(`auth_${token}`, String(user._id), 86400);
      res.status(200).json({
        token,
      }).end();
    }
  },

  async getDisconnect(req, res) {
    // Get the token from the header, get the user_id from redis client
    const token = req.get('x-token');
    const key = `auth${token}`;
    const userId = await redisClient.get(key);

    // Get the user from db client
    const user = dbClient.getData({ _id: ObjectId(userId) });

    if (user) {
      await redisClient.del(`auth_${token}`);
      res.status(204).end();
    } else {
      res.status(401).json({
        error: 'Unauthorized',
      }).end();
    }
  },
};

export default AuthController;
