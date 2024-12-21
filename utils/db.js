import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    // Connect to the database using .connect method
    this.client.connect().catch((err) => {
      throw err;
    });
    this._db = process.env.DB_DATABASE || 'files_manager';
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db(this._db).collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db(this._db).collection('files').countDocuments();
  }

  async getUser(keys, collection = 'users') {
    const user = await this.client.db(this._db).collection(collection).findOne(keys);
    if (user) { return user; }
    return null;
  }

  async saveUSer(email, password) {
    const newUser = await this.client.db(this._db).collection('users').insertOne({
      email,
      password,
    });
    return newUser.insertedId;
  }
}

const dbClient = new DBClient();
export default dbClient;
