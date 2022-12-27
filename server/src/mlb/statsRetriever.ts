import _ from 'lodash';

import { Logger } from '../logging';
import { outputToFile, readFromFile } from '../utils/output';
import { sleep } from '../utils/utils';

import { getSchedule, getGameBoxScore } from './sportRadar';

const AWAIT_REQUEST_MS = 1500;

interface Team {
  id: string;
  name: string;
  alias: string
}

interface Game {
  id: string;
  date: string;
  home_team: Team;
  away_team: Team;
  home_points: number;
  away_points: number;
  // scoring: Scoring;
  boxScore: BoxScore;
  venue: Venue;
  status: string;
  title: string;
}

interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface BoxScore {}

export async function doSeason(refresh?:boolean) : Promise<{csv:string,json:any}> {
    let games:Game[] = await _getSchedule(refresh);

    // get played games, exclude all star games
    games = _.filter(games,(game:Game)=>(game.status === 'closed') && 
      !(/All-Star Game/i).test(game.title));

    await sleep(AWAIT_REQUEST_MS);
    Logger.info(`Retrieving ${games.length} stats. Each request will wait ${AWAIT_REQUEST_MS/1000}s, this could take a while.`)
    let boxScores:any[] = [];
    for (let i = 0; i < games.length; i++) {
      let game = games[i];
      let game_stats:any = await _getOrCreateFile('./output/game_stats/mlb/' + game.id, async ()=>{
        let stats = await getGameBoxScore(game.id);
        await sleep(AWAIT_REQUEST_MS);
        return stats;
      });
      boxScores.push(_.merge(game,{game_stats}));
    }

    Logger.info(`Finished retrieving all ${games.length} games`);

    // let csv:string = _convertToCSV([]);

    return {
      csv: '',
      json: boxScores
    }
}

async function _getSchedule(refresh:boolean=false) : Promise<any> {

  let file = await readFromFile('./MLB_SeasonData2021.json');
  let seasonData:any = ( refresh || !file) ? undefined : JSON.parse(file);

  if (!seasonData) {
    let resp = await getSchedule();

    seasonData = _.get(resp,'data.games',[]);

    // write the json to file
    await outputToFile('./MLB_SeasonData2021.json',JSON.stringify(seasonData));
  }

  return seasonData;
}

type RetrieveFunction = (...args: any) => Promise<any>;
async function _getOrCreateFile(filePath:string,retrieve:RetrieveFunction) : Promise<any> {
  let retVal:any;
  try {
    let data = await readFromFile(filePath);
    if (data) {
      retVal = JSON.parse(data);
    }
  }
  catch (err) {
    Logger.error(err);
    retVal = undefined;
  }
  if (!retVal) {
    let resp = await retrieve();

    retVal = _.get(resp,'data',{});

    await outputToFile(filePath,JSON.stringify(retVal));
  }

  return retVal;
}