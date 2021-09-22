import _ from 'lodash';
import moment from 'moment';

import { Logger } from '../logging';
import { getOddsSpread } from './sportsOdds';
import { convertToCsv, createDatedFileName, outputToFile, readFromFile } from './output';
import { getTeamName } from './teams';
import { iSportType } from './interfaces';

const dateFormat = 'MM/DD dd hh:mm A';

export interface Game {
  date: number;
  date_display: string;
  home_team: string;
  away_team: string;
  odds_source?: string;
  odds_last_update?: string;
  odds_spread?: string;
  odds_spread_vig?: string;
  odds_moneyline?: string;
  odds_totals?: string;
  odds_totals_vig?:string;
}

const fields = [
  {
    label:'date',
    value:'date_display'
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
    label: 'spread_vig',
    value:'odds_spread_vig',
    default: ''
  },
  {
    label: 'ML',
    value: 'odds_moneyline',
    default: ''
  },
  {
    label: 'O/U',
    value: 'odds_totals',
    default: ''
  },
  {
    label: 'O/U_vig',
    value: 'odds_totals_vig',
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
  let gameOdds:any[] = refresh ? undefined :JSON.parse( await readFromFile(`./${_.upperCase(sport.display)}_oddsData.json`));
  
  if (!gameOdds) {
    let resp = await getOddsSpread(sport.sport);

    gameOdds = _.get(resp,'data',[]);

    // write the json to file
    await outputToFile(`${_.upperCase(sport.display)}_oddsData.json`,JSON.stringify(gameOdds));
  }

  return gameOdds;
}

function _parseGames(games:any[]) : Game[] {
  return _.sortBy(games.map(data=>{
    let odds = _.find(data.bookmakers,['key','fanduel']);
    if (!odds) { odds = _.find(data.bookmakers, ['key', 'draftkings']); }
    if (!odds) { odds = _.find(data.bookmakers,['key','bovada']);}
    if (!odds && data.bookmakers.length>0) {
      odds = data.bookmakers[0];
    }

    // get ML
    let ml = _.find(odds.markets,['key','h2h']);

    // get spreads
    let spreads = _.find(odds.markets,['key','spreads']);

    // get totals
    let totals = _.find(odds.markets, ['key', 'totals']);

    let game:Game = {
      date: moment(data.commence_time).valueOf(),
      date_display: moment(data.commence_time).format(dateFormat),
      home_team: getTeamName(data.home_team),
      away_team: getTeamName(data.away_team),
    };

    if (spreads) {
      game.odds_source = odds.key;
      game.odds_last_update = moment(odds.last_update).format(dateFormat);

      let firstIsHome = spreads.outcomes[0].name === data.home_team;

      game.odds_spread = firstIsHome ? spreads.outcomes[0].point : spreads.outcomes[1].point;
      game.odds_spread_vig = firstIsHome ? spreads.outcomes[0].price : spreads.outcomes[1].price;
    }

    if (ml) {
      let firstIsHome = ml.outcomes[0].name === data.home_team;

      game.odds_moneyline = firstIsHome ? ml.outcomes[0].price : ml.outcomes[1].price;
    }

    if (totals) {
      let firstIsHome = totals.outcomes[0].name === data.home_team;

      game.odds_totals = firstIsHome ? totals.outcomes[0].point : totals.outcomes[1].point;
      game.odds_totals_vig = firstIsHome ? totals.outcomes[0].price : totals.outcomes[1].price;
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
  let csv:string = convertToCsv(games,{fields});

  if (csv!=='') {
    Logger.debug(`Creating csv file from this week's odds`);
    // create the odds file
    await outputToFile(createDatedFileName(`${sport.display}_odds.csv`),csv);
  }

  Logger.info(`Created Odds File successful`);

  return games;
}