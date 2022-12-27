import _ from 'lodash';

import { Logger } from '../logging';
import { getTeamName } from '../utils/teams';
import { convertToCsv, createDatedFileName, outputToFile, readFromFile } from '../utils/output';
import { getSchedule, getGameStats } from './sportRadar';
import { sleep } from '../utils/utils';

const AWAIT_REQUEST_MS = 1000;

interface Team {
  id: string;
  name: string;
  alias: string
}

interface Scoring_Period {
  id: string;
  number:string;
  away_points: number;
  home_points: number; 
  period_type: string;
}

interface Scoring {
  away_points: number;
  home_points: number;
  period: Scoring_Period[];
}

interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
  surface: string;
  roof_type: string;
}

interface Game {
  id: string;
  date: string;
  home_team: Team;
  away_team: Team;
  scoring: Scoring;
  venue: Venue;
}

interface Week {
  id: string;
  title: string;
  games: Game[];
}

const fields = [
  {
    value:'week'
  },
  {
    value:'id'
  },
  {
    value:'scheduled'
  },
  {
    label:'home_team',
    value:'home_team'
  },
  {
    label:'away_team',
    value:'away_team'
  },
  {
    label:'home_points',
    value:'scoring.home_points'
  },
  {
    label:'away_points',
    value:'scoring.away_points'
  },
  {
    label:'home_total_rushing_yards',
    value:'home_total_rushing_yards'
  },
  {
    label:'away_total_rushing_yards',
    value:'away_total_rushing_yards'
  },
  {
    label:'home_total_passing_yards',
    value:'home_total_passing_yards'
  },
  {
    label:'away_total_passing_yards',
    value:'away_total_passing_yards'
  }
]

const transform = (entry:any) => {
  try {
    entry.home_team = getTeamName(entry.home.name);
    entry.away_team = getTeamName(entry.away.name);
    entry.home_total_yards = entry.game_stats.statistics.home.summary.total_yards;
    entry.away_total_yards = entry.game_stats.statistics.away.summary.total_yards;
    entry.home_penalty_yards = entry.game_stats.statistics.home.summary.penalty_yards;
    entry.away_penalty_yards = entry.game_stats.statistics.away.summary.penalty_yards;
    entry.home_turnovers = entry.game_stats.statistics.home.summary.turnovers;
    entry.away_turnovers = entry.game_stats.statistics.away.summary.turnovers;
    entry.home_total_rushing_yards = entry.game_stats.statistics.home.rushing.totals.yards;
    entry.away_total_rushing_yards = entry.game_stats.statistics.away.rushing.totals.yards;
    entry.home_avg_rush_yards = entry.game_stats.statistics.home.rushing.totals.avg_yards;
    entry.away_avg_rush_yards = entry.game_stats.statistics.away.rushing.totals.avg_yards;
    entry.home_total_passing_yards = entry.game_stats.statistics.home.passing.totals.yards;
    entry.away_total_passing_yards = entry.game_stats.statistics.away.passing.totals.yards;
    entry.home_avg_pass_yards = entry.game_stats.statistics.home.passing.totals.avg_yards;
    entry.away_avg_pass_yards = entry.game_stats.statistics.away.passing.totals.avg_yards;
    entry.home_def_sacks = entry.game_stats.statistics.home.defense.totals.sacks;
    entry.away_def_sacks = entry.game_stats.statistics.away.defense.totals.sacks;
    entry.home_def_comb_tackles = entry.game_stats.statistics.home.defense.totals.combined;
    entry.away_def_comb_tackles = entry.game_stats.statistics.away.defense.totals.combined;
    entry.home_def_blitzes = entry.game_stats.statistics.home.defense.totals.blitzes;
    entry.away_def_blitzes = entry.game_stats.statistics.away.defense.totals.blitzes;
    entry.home_def_hurries = entry.game_stats.statistics.home.defense.totals.hurries;
    entry.away_def_hurries = entry.game_stats.statistics.away.defense.totals.hurries;
    entry.home_def_knockdowns = entry.game_stats.statistics.home.defense.totals.knockdowns;
    entry.away_def_knockdowns = entry.game_stats.statistics.away.defense.totals.knockdowns;
    entry.home_def_batted_passes = entry.game_stats.statistics.home.defense.totals.batted_passes;
    entry.away_def_batted_passes = entry.game_stats.statistics.away.defense.totals.batted_passes;
    entry.home_eff_thirddown_pct = entry.game_stats.statistics.home.efficiency.thirddown.pct;
    entry.away_eff_thirddown_pct = entry.game_stats.statistics.away.efficiency.thirddown.pct;
    entry.home_touchdowns_rush = entry.game_stats.statistics.home.touchdowns.rush;
    entry.away_touchdowns_rush = entry.game_stats.statistics.away.touchdowns.rush;
    entry.home_touchdowns_pass = entry.game_stats.statistics.home.touchdowns.pass;
    entry.away_touchdowns_pass = entry.game_stats.statistics.away.touchdowns.pass;
  }
  catch (err) {
    Logger.error(err);
  }

  return entry;
};

export async function doSeason(refresh?:boolean) : Promise<any> {
  try {
    let games:Game[] = await getSeasonGames(refresh);

    // get played games
    games = _.filter(games,['status','closed']);

    await sleep(AWAIT_REQUEST_MS);
    Logger.info(`Retreiving ${games.length} stats. Each request will wait ${AWAIT_REQUEST_MS/1000}s, this could take a while.`)
    let withStats:any[] = [];
    for (let i = 0; i < games.length; i++) {
      let game = games[i];
      let game_stats:any = await _getOrCreateFile('./output/game_stats/nfl/' + game.id, async ()=>{
        let stats = await getGameStats(game.id);
        await sleep(AWAIT_REQUEST_MS);
        return stats;
      });
      withStats.push(_.merge(game,{game_stats}));
    }

    let csv:string = convertToCsv(withStats,{fields,transforms:[transform]})

    if (csv!=='') {
      Logger.debug(`Creating csv file from this week's odds`);
      // create the odds file
      await outputToFile(createDatedFileName('season.csv'),csv);
      Logger.info(`Created Season Results successful`);
    }

    return {
      csv,
      json: withStats
    }
  }
  catch(err) {
    Logger.error(err);
  }
}

export async function getSeasonGames(refresh?:boolean) : Promise<Game[]> {
  let seasonData = await _getSchedule(refresh);

  let weeks:Week[] = _.get(seasonData,'weeks');

  return _.flatMap(weeks, ({ title, games }) =>_.map(games, game => ({ week:title, ...game })));
}

async function _getSchedule(refresh:boolean=false) : Promise<any> {
  let seasonData:any;
  try {
    seasonData = refresh ? undefined : JSON.parse( await readFromFile('./NFL_SeasonData2021.json'));
  }
  catch (err) {
    Logger.error(err);
    seasonData = undefined;
  }  
  if (!seasonData) {
    let resp = await getSchedule();

    seasonData = _.get(resp,'data',[]);

    // write the json to file
    await outputToFile('./NFL_SeasonData2021.json',JSON.stringify(seasonData));
  }

  return seasonData;
}

async function _getGameStats(gameId:string) : Promise<any> {
  // look locally
  let gameData:any;
  try {
    gameData = await readFromFile('./output/game_stats/nfl/' + gameId);
  } catch (err) {
    Logger.error(err);
    gameData = undefined;
  }
  if (!gameData) {
    let resp = await getGameStats(gameId);

    gameData = _.get(resp,'data',{});

    await outputToFile('./output/game_stats/' + gameId,JSON.stringify(gameData));
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