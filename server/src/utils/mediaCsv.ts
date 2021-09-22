import csv from 'csv-parser';
import fs from 'fs';

import { Logger } from '../logging';


export function openNFLStatsCsv(path:string, convertFunc:(input:any)=>any) : Promise<string[]> {
    return new Promise((resolve,reject)=>{
        let retVals:any[] = [];

        try {
            fs.createReadStream(path)
            .pipe(csv())
            .on('data', (row:any) => {
                retVals.push(convertFunc(row));
            })
            .on('end', () => {
                resolve(retVals);
            });
        } catch (err) {
            Logger.error(err);
            reject(err);
        }
    });
}

export async function readCsv<T extends any[]>() : Promise<T[]> {
    let retVals:T[] = [];

    return retVals;
}

