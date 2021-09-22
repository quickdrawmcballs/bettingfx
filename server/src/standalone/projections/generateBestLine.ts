import { resolve } from 'path';
import { argv } from 'process';
import { createReadStream, createWriteStream } from 'fs';
import { parse as csvParse } from 'fast-csv';
import { number } from 'yargs';
import _ from 'lodash';

import { convertToCsv, createDatedFileName, outputToFile, readFromFile } from '../../utils/output';

interface Player {
    name: string;
    search: string;
    fp: number;
    overall: number;
    position: number;
    pos: string;
    opp: string;
    oppRank: number;
}
interface Output extends Player {
    league: string;
}

const fields = [
    {
        label: 'name',
        value: 'name'
    },
    {
        label: 'league',
        value: 'league'
    },
    {
        label: 'pos',
        value: 'pos'
    },
    {
        label: 'fp',
        value: 'fp'
    },
    {
        label: 'position',
        value: 'position'
    },
    {
        label: 'overall',
        value: 'overall'
    },
    {
        label: 'opp',
        value: 'opp'
    },
    {
        label: 'oppRank',
        value: 'oppRank'
    }
];

async function readCSV(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
        let rows: any[] = [];

        createReadStream(filePath)
            .pipe(csvParse({ 'headers': true }))
            .transform((row:any, next): void => {
                let everything = row['Player'];

                let posTeam = (/\(([^\)]+)\)/).exec(everything) as RegExpExecArray;
                let search = everything.replace(posTeam[0],'');
                let pos = (posTeam[1]).split(', ')[0];
                let name = search.split(' ');
                name = `${name[0]} ${name[1]}`

                let player:Player = {
                    fp: +row['FP'],
                    name,
                    search,
                    pos,
                    overall: +(row['Ovr.'].replace('#', '')),
                    position: +(row['Pos.'].replace('#', '')),
                    opp: row['Team'],
                    oppRank: +(row['Rank'].replace('#', ''))

                };

                return next(null,player);
            })
            .on('error', error => reject(error))
            .on('data', row => rows.push(row))
            .on('end', (rowCount: number) => {
                console.log(`Parsed ${rowCount} rows`);
                resolve(rows);
            });
    });
}


async function main() {
    let week = Number(argv[0]) || 2;

    // get the projections
    let projections = await readCSV(resolve(__dirname, `../../../data/projections/nfl/week-${week}-fantasy-football-player-ppr-projections.csv`))

    // get the teams
    // let file = await readFromFile('./NBA_SeasonData2020.json');
    let teams = await readFromFile(resolve(__dirname, `../../../data/projections/nfl/teams.json`));
    teams = JSON.parse(teams);

    let validLineups:Output[] = [];

    // loop thru each team and thier players and match the projections
    teams.forEach((team:any) => {
        // let valid: Output[] = [];

        team.Players.forEach( (player:string) => {
            let found = _.find(projections, (projection: Player) => {
                let regex = new RegExp(player.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
                return regex.test(projection.search);
            });
            if (found) {
                let push = Object.assign({}, found);
                push.league = team.League;
                validLineups.push(push);
            }
        });
        // if (valid.length>0) {
        //     validLineups.push(_.orderBy(valid, 'fp','desc'));
        // }
    });

    // write out the validLinups to csv
    if (validLineups.length>0) {
        let csv: string = convertToCsv(validLineups, { fields });

        if (csv !== '') {
            console.debug(`Creating csv file for lineups`);
            // create the odds file
            await outputToFile(createDatedFileName(`WEEK_${week}_fantasy_lineup.csv`), csv);
        }
    }
    // open up projections
    console.debug(`Finished with lineups`);
}


main();

// open up current teams 

    // print out per team a csv