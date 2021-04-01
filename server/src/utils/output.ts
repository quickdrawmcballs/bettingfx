import _ from 'lodash';
import { promises as fsPromises } from 'fs';
import path from 'path';
import moment from 'moment';
import { parse } from 'json2csv';

import { Logger } from '../logging';

// function outputToFile(filePath:string,data:any) {
//   return new Promise((resolve,reject)=>writeFile(filePath,data,err=>{
//     if (err) reject(err); else resolve(true);
//   }));
// };
export async function outputToFile(filePath:string,data:any) : Promise<any> {
  try {
    // ensure path exist
    await fsPromises.mkdir(path.dirname(filePath),{recursive:true});

    let output = await fsPromises.writeFile(filePath, data);
    Logger.info(`Successfully created ${filePath}`);
    return output;
  } catch (err) {
    Logger.error(err);
  }
}

export async function readFromFile(filePath:string,options?:any) : Promise<any> {
  try {
    return await fsPromises.readFile(filePath, options);
  } catch (err) {
    (_.get(err,'code') === 'ENOENT') ? Logger.debug(err.toString()) : Logger.error(err);;
  }
}

export function createDatedFileName(filename:string, date?:string|Date) : string {
  let strDate = date ? moment(date) : moment();

  return './output/' + strDate.format('YYYYMMDD-HHmmss') + '_' + filename;
}

export function convertToCsv(data:any, opts?:any) : string {
  let csv:string;

  try {
    Logger.debug(`Parsing into csv`);
    csv = parse(data,opts);
  } catch (err) {
    csv = '';
    Logger.error(err);
  }

  return csv;
}