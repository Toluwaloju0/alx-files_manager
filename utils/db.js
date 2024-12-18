import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const url = `mongodb://${host}:${port}`

    this.client = MongoClient(url);
    this.client.connect().catch((err) => { console.log(err) });

    this._db = process.env.DB_DATABASE || 'files_manager';
  }

  isAlive() {
   this.client.isConnected();
  }

  async nbUsers() {
    return await this.client.db(this._db).collection('users').countDocuments();
  }

  async nbFiles() {
    return await this.client.db(this._db).collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
