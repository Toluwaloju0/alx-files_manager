import fs from 'fs/promises';
import path from 'path';
import decoder

export async function writeFile(folde, fileName, data) {
  // await the creation of the folder if it doesnt exist. set recursive to true
  await fs.mkdir(folder, { recursive: true })
  
}