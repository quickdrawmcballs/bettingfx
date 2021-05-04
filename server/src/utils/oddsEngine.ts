import _ from 'lodash';
import moment from 'moment';

import { Logger } from '../logging';
import { getOddsSpread } from './sportsOdds';
import { convertToCsv, createDatedFileName, outputToFile, readFromFile } from './output';
import { getTeamName } from './teams';
import { iSportType } from './interfaces';

const dateFormat = 'MM/D hh:mm A';

export interface Game {
  date: number;
  home_team: string;
  away_team: string;
  odds_source?: string;
  odds_last_update?: string;
  odds_spread?: string;
  odds_vig?: string;
}

const fields = [
  {
    label:'date',
    value:'date'
  },
  {
    label: 'away',
    value:'away_team'
  },
  {
    label: 'home',
    value:'home_team'
  },
  {
    label: 'spread',
    value: 'odds_spread',
    default: ''
  },
  {
    label: 'vig',
    value:'odds_vig',
    default: ''
  },
  {
    label: 'src',
    value: 'odds_source',
    default: ''
  },
  {
    label: 'updated',
    value: 'odds_last_update',
    default: ''
  }
]

async function _retreiveGameOdds(sport:iSportType,refresh:boolean=true) : Promise<any[]> {
  let gameOdds:any[] = refresh ? undefined :JSON.parse( await readFromFile(`./${sport.display}_oddsData.json`));
  
  if (!gameOdds) {
    let resp = await getOddsSpread(sport.sport);

    gameOdds = _.get(resp,'data.data',[]);

    // write the json to file
    await outputToFile(`${sport.display}_oddsData.json`,JSON.stringify(gameOdds));
  }

  return gameOdds;
}

function _parseGames(games:any[]) : Game[] {
  return _.sortBy(games.map(data=>{
    let odds = _.find(data.sites,['site_key','bovada']);
    if (!odds) {odds = _.find(data.sites,['site_key','draftkings']);}
    if (!odds && data.sites.length>0) {
      odds = data.sites[0];
    }

    let firstIsHome = data.teams[0] === data.home_team;

    let game:Game = {
      date: moment(data.commence_time).valueOf(),
      home_team: getTeamName(data.home_team),
      away_team: getTeamName(firstIsHome? data.teams[1] : data.teams[0]),
    };

    if (odds) {
      game.odds_last_update = moment(odds.last_update).format(dateFormat);
      game.odds_source = odds.site_key;
      game.odds_spread = firstIsHome ? odds.odds.spreads.points[0] : odds.odds.spreads.points[1];
      game.odds_vig = firstIsHome ? odds.odds.spreads.odds[0] : odds.odds.spreads.odds[1];
    }

    return game;
  }),['date', 'home_team']);
}

export async function getOdds(sport:iSportType,refresh:boolean=true) : Promise<Game[]> {
  let gameOdds:any[] = await _retreiveGameOdds(sport,refresh);

  return _parseGames(gameOdds);
}

export async function doOdds(sport:iSportType,refresh:boolean=true) : Promise<Game[]> {

  let gameOdds:any[] = await _retreiveGameOdds(sport,refresh);

  let games:Game[] = _parseGames(gameOdds);

  // sort and convert to csv
  let csv:string = convertToCsv(games,{fields})

  if (csv!=='') {
    Logger.debug(`Creating csv file from this week's odds`);
    // create the odds file
    await outputToFile(createDatedFileName(`${sport.display}_odds.csv`),csv);
  }

  Logger.info(`Created Odds File successful`);

  return games;
}