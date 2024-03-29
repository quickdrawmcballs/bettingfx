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

export async function getAllPlayedGames(refresh?:boolean,year?:string) : Promise<{csv:string,json:any}> {
  let wholeYear:any = await Promise.all([getPlayedGames(refresh,year,'REG'),getPlayedGames(refresh,year,'PST')]);


  return {
    csv: '',
    json: wholeYear.flatMap((cat:any)=>cat.json)
  };
}

export async function getPlayedGames(refresh?:boolean,year?:string,season?:string) : Promise<{csv:string,json:any}> {
  let games:Game[] = await _getSchedule(refresh,year,season);

  // get played games, exclude all star games
  // games = _.filter(games,['status','closed']);
  // games = _.filter(games,['title', '2021 NBA All-Star Game']);
  games = _.filter(games,(game:Game) => (game.status === 'closed') && 
    !(/All-Star Game/i).test(game.title));

  await sleep(AWAIT_REQUEST_MS);
  Logger.info(`Retrieving ${games.length} stats. Each request will wait ${AWAIT_REQUEST_MS/1000}s, this could take a while.`)
  let boxScores:any[] = [];
  for (let i = 0; i < games.length; i++) {
    let game = games[i];
    let game_stats:any = await _getOrCreateFile('./output/game_stats/nba/' + game.id, async ()=>{
      let stats = await getGameBoxScore(game.id);
      await sleep(AWAIT_REQUEST_MS);
      return stats;
    });
    boxScores.push(_.merge(game,{game_stats}));
  }

  Logger.info(`Finished retrieving all ${games.length} games`);

  let csv:string = _convertToCSV([]);

  return {
    csv,
    json: boxScores
  }
}

export async function getRemainingGames(refresh?:boolean) : Promise<{csv:string,json:any}> {
  let games:Game[] = await _getSchedule(refresh);

  // get played games, exclude all star games
  // games = _.filter(games,['status','closed']);
  // games = _.filter(games,['title', '2021 NBA All-Star Game']);
  games = _.filter(games,(game:Game) => ((game.status === 'scheduled') || (game.status === 'time-tbd') && 
    !(/All-Star Game/i).test(game.title)));

    let csv:string = _convertToCSV([]);

    return {
      csv,
      json: games
    }
}

function _convertToCSV(boxScores:any[]) : string {
    // let csv:string = convertToCsv(boxScores,{fields,transforms:[transform]})

    // if (csv!=='') {
    //   Logger.debug(`Creating csv file from this week's odds`);
    //   // create the odds file
    //   await outputToFile(createDatedFileName('season.csv'),csv);
    //   Logger.info(`Created Season Results successful`);
    // }

    return '';
}

async function _getSchedule(refresh:boolean=false,year:string='2022',season:string='REG') : Promise<any> {
  let seasonData:any;
  let filename = `NBA_${season}SeasonData${year}.json`;
  try {
    // let file = await readFromFile('./NBA_SeasonData2020.json');
    let file = await readFromFile(filename);
    seasonData = ( refresh || !file) ? undefined : JSON.parse(file);
  }
  catch (err) {
    Logger.error(err);
    seasonData = undefined;
  }  

  if (!seasonData) {
    let resp = await getSchedule(year,season);

    seasonData = _.get(resp,'data.games',[]);

    // write the json to file
    await outputToFile(filename,JSON.stringify(seasonData));
  }

  return seasonData;
}

async function _getGameStats(gameId:string) : Promise<any> {
  // look locally
  let gameData:any;
  try {
    gameData = await readFromFile('./output/game_stats/' + gameId);
  } catch (err) {
    Logger.error(err);
    gameData = undefined;
  }
  if (!gameData) {
    let resp = await getGameBoxScore(gameId);

    gameData = _.get(resp,'data',{});

    await outputToFile('./output/nba/game_stats/' + gameId,JSON.stringify(gameData));
  }

  return gameData;
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