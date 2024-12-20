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
  getStat(req, res) {
    let users = 0;
    let files = 0;
    dbClient.nbUsers().then((nbUsers) => {
      users = nbUsers;
    });
    dbClient.nbFiles().then((nbFiles) => {
      files = nbFiles;
    });
    res.status(200).json({
      users,
      files,
    }).end();
  },
};

export default AppController;
