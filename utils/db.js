import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    if (process.env.DB_HOST === null) {const host = 'localhost'}
    else {const host = process.env.DB__HOST}
    if (process.env.DB_PORT === null) {const port = '27017'}
    else {const port = process.env.DB_PORT}
    if (process.env.DB_DATABASE === null) {const db = 'file_manager'}
    else {const db = process.env.DB_DATABASE}

    this.client = MongoClient(`mongodb://${host}:${port}`)
  }

  isAlive() {
    this.client.on('connect' () => {return true})
    return false
  }
}