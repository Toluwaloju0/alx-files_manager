import { createClient, print } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.log(err);
    });
  }

  isAlive() {
    this.client.on('connect', () => {return true});
    return false;
  }

  async get(key) {
    this.client.get(key, (err, data) => {
      if (!err) {return data}
    })
  }

  async set(key, value, duration) {
    this.client.set(key, value, print);
    this.client.expire(key, duration);
  }

  async del(key) {
    this.client.del(key);
  }
}

const redisClient = RedisClient();

export redisClient;