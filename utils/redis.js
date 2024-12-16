import { createClient, print } from 'redis';

class RedisClient {
  constructor() {
    this.client  = createClient();
    this.client.on('error', function (err) {
      console.log(err);
    })
  }

  isAlive() {
    return this.client.on('connect', () => {return true});
  }

  async get(key) {
    this.client.get(key, (value) => {return value});
    return null
  }

  async set(key, value, duration) {
    this.client.set(key, value);
    this.client.expire(key, duration);
  }

  async del(key) {
    await this.client.del(key);
  }
}

export const redisClient = new RedisClient();
