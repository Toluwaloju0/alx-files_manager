import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import createHash from '../utils/hashPwd';
import redisClient from '../utils/redis';

const UsersController = {
  async postNew(req, res) {
    const { email, password } = req.body;
    if (email === undefined) {
      res.status(400).json({ error: 'Missing email' }).end();
      return;
    } if (password === undefined) {
      res.status(400).json({ error: 'Missing password' }).end();
      return;
    }
    const user = await dbClient.getData({ email });
    if (user) {
      res.status(400).json({ error: 'Already exist' }).end();
    } else {
      const id = await dbClient.saveUSer(email, createHash(password));
      // respond with the created id and email
      res.status(201).json({
        id,
        email,
      }).end();
    }
  },

  async getMe(req, res) {
    // Get the token for the user auth then get the user id in redis
    const token = req.get('x-token');
    const Id = await redisClient.get(`auth_${token}`);

    // get the user from the db client
    const user = await dbClient.getData({ _id: ObjectId(Id) });
    if (user) {
      res.json({
        id: user._id,
        email: user.email,
      }).end();
    } else {
      res.status(401).json({
        error: 'Unauthorized',
      }).end();
    }
  },
};

export default UsersController;
