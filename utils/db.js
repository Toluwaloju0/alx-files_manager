import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const db = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${url}`

    // MongoClient.connect(url, (err, DB) => {
    //   if (!err) {db = DB}
    // })
    // this.db = db

    this._db = new MongoClient(url);
  }

  isAlive() {
   return this._db.isConnected();
  }

  async nbUsers() {
    return this._db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this._db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
