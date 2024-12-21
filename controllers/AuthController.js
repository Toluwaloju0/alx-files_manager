import { uuid } from 'uuidv4';
import stringDecode from '../utils/decoder';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AuthController = {
  async getConnect(req, res) {
    // Get the basic auth stringet the and convert it, get the token
    const Auth = req.get('Authorization').split(' ');
    const decoded = stringDecode(Auth[1]);
    const token = uuid();

    // Get the user from db client
    const user = await dbClient.getUser({ email: decoded[0] });
    if (user === null) {
      res.status(401).json({
        error: 'Unauthorized',
      }).end();
    } else {
      const key = `auth_${token}`;
      await redisClient.set(key, user._id, 86400);
      res.status(200).json({
        token,
      }).end();
    }
  },

  async getDisconnect(req, res) {
    // Get the token from the header, get the user_id from redis client
    const token = req.get('x-token');
    const userId = await redisClient.get(`auth_${token}`);

    // Get the user from db client
    const user = dbClient.get({ _id: userId });

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
