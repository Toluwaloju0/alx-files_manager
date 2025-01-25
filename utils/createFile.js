import fs from 'fs/promises';
import path from 'path';
import decoder from './decoder';
import { v4 } from 'uuid';

export async function writeFile(folder, fileName, data) {
  // await the creation of the folder if it doesnt exist. set recursive to true
  await fs.mkdir(folder, { recursive: true });
  // create the file name using the v4 module
  const fileName = `${folder}/${v4()}`;
  // change the data to the clear form from base64
  const Data = decoder.dataDecoder(data);
  // write the clear data into the file
  await fs.writeFile(fileName, Data, { mode: 0o666, flag: 'w' })
  
}