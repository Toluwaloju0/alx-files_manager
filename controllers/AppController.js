import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const AppController = {
  // get status funtion for the GET /status route
  getStatus(req, res) {
    if (redisClient.isAlive() && dbClient.isAlive) {
      res.status(200).json({
        redis: true,
        db: true,
      }).end();
    }
  },

  // The get stat function forthe GET /stat route
  async getStat(req, res) {
    const resData = {};
    await dbClient.nbUsers().then((nbUsers) => {
      resData.users = nbUsers;
    });
    await dbClient.nbFiles().then((nbFiles) => {
      resData.files = nbFiles;
    });
    res.status(200).json(resData).end();
  },
};

export default AppController;
