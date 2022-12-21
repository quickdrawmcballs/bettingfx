
import _ from 'lodash';

import { doSeason as NFLSeason } from './statsRetreiver';
import { openNFLStatsCsv } from '../utils/mediaCsv';
import { convertToCsv, createDatedFileName, outputToFile } from '../utils/output';
import { Logger } from '../logging';
import { Ribbon } from 'd3-chord';
import { formatFloat } from '../utils/utils';

type TriState = true | false | null;
type HomeAway = 'Home' | 'Away' | null;

interface game {
  home: string;
  away: string;

  home_1st: number;
  home_2nd: number;
  home_3rd: number;
  home_4th: number;
  home_final: number;
  away_1st: number;
  away_2nd: number;
  away_3rd: number;
  away_4th: number;
  away_final: number;

  total_open: number;
  total_close: number;
  home_odds_open: number;
  home_odds_close: number;
  away_odds_open: number;
  away_odds_close: number;
  second_total: number;
  second_home_odds: number;
  second_away_odds: number;
  home_money_line: number;
  away_money_line: number;

  favorite: HomeAway;

  home_win: TriState;
  favorite_win: TriState;
}

class Game {
  home: string = '';
  away: string = '';

  home_1st: number = 0;
  home_2nd: number = 0;
  home_3rd: number = 0;
  home_4th: number = 0;
  home_final: number = 0;
  away_1st: number = 0;
  away_2nd: number = 0;
  away_3rd: number = 0;
  away_4th: number = 0;
  away_final: number = 0;

  total_open: number = 0;
  total_close: number = 0;
  home_odds_open: number = 0;
  home_odds_close: number = 0;
  away_odds_open: number = 0;
  away_odds_close: number = 0;
  second_total: number = 0;
  second_home_odds: number = 0;
  second_away_odds: number = 0;
  home_money_line: number = 0;
  away_money_line: number = 0;

  favorite: HomeAway = null;
  home_win: TriState = null;
  favorite_win: TriState = null;

  constructor(line?: any) {
    if (line) {
      this.away = line.Team;
      this.away_money_line = line.ML;
      this.away_1st = line['1st'];
      this.away_2nd = line['2nd'];
      this.away_3rd = line['3rd'];
      this.away_4th = line['4th'];
      this.away_final = line.Final;
    }
  }
}

class GameResult extends Game {
  winMargin: number = 0;
  home_cover: TriState = null;
  away_cover: TriState = null;

  constructor(game:Game) {
    super();

    _.merge(this,game);

    this.winMargin = Math.abs(game.home_final - game.away_final);

    // no favorite
    if (game.home_odds_close===0) {
      this.home_cover = game.home_win === true;
      this.away_cover = game.home_win === false;
    }
    // home was underdog and getting points
    else if (game.home_odds_close>0) {
      let homeAdj = (game.home_final - game.home_odds_close);

      this.home_cover = (homeAdj === game.away_final)?null:(homeAdj>game.away_final);
      this.away_cover = this.home_cover === null ? null : !this.home_cover;
    }
    // home was favorite
    else {
      let homeAdj = (game.home_final + game.home_odds_close);

      this.home_cover = (homeAdj === game.away_final) ? null : (homeAdj > game.away_final);
      this.away_cover = this.home_cover === null ? null : !this.home_cover;
    }
  }
}

function convertLineToNumbers(line: any): any {
  line['1st'] = Number(line['1st']) || 0;
  line['2nd'] = Number(line['2nd']) || 0;
  line['3rd'] = Number(line['3rd']) || 0;
  line['4th'] = Number(line['4th']) || 0;

  line.Final = Number(line.Final) || 0;
  line.Open = Number(line.Open) || 0;
  line.Close = Number(line.Close) || 0;
  line.ML = Number(line.ML) || 0;
  line['2H'] = Number(line['2H']) || 0;

  return line;
}

const transform = (entry: any) => {
  try {
    entry.home_team = entry.home;
    entry.away_team = entry.away;
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

const fields = [
  {
    value: 'week'
  },
  // {
  //   value: 'id'
  // },
  // {
  //   value: 'scheduled'
  // },
  {
    value: 'away'
  },
  {
    value: 'home'
  },
  {
    value: 'home_win'
  },
  {
    value: 'favorite_win',
    label: 'fav_win'
  },
  {
    value: 'away_final'
  },
  {
    value: 'home_final'
  },  
  {
    value: 'home_money_line',
    label: 'home_ML'
  },
  {
    value: 'home_odds_close'
  },
  {
    value: 'away_1st'
  },
  {
    value: 'home_1st'
  },
  {
    value: 'away_2nd'
  },
  {
    value: 'home_2nd'
  },
  {
    value: 'away_3rd'
  },
  {
    value: 'home_3rd'
  },
  {
    value: 'away_4th'
  },
  {
    value: 'home_4th'
  }
  // {
  //   value: 'second_total'
  // },
  // {
  //   value: 'second_home_odds'
  // }
]

async function doCalcs(games: any[]) {

  let results: GameResult[] = games.map((game:Game)=>new GameResult(game));

  // let homeTeamWin: any[] = _.filter(games, (game: Game) => game.home_win === true);
  // let awayTeamWin: any[] = _.filter(games, (game: Game) => game.home_win === false);

  // let homeTeamCover: any[] = _.filter(results, (game: GameResult) => game.home_cover === true);
  // let awayTeamCover: any[] = _.filter(results, (game: GameResult) => game.away_cover === true);

  let homeTeamWin: GameResult[] = [];
  let awayTeamWin: GameResult[] = [];

  let homeTeamCover: GameResult[] = [];
  let awayTeamCover: GameResult[] = [];

  let favoriteCover: GameResult[] = [];
  let underDogCover: GameResult[] = [];

  let favoriteUpAtHalfCover: GameResult[] = [];
  let favoriteUpAtHalfLoss: GameResult[] = [];
  let underdogUpAtHalfCover: GameResult[] = [];
  let underdogUpAtHalfLoss: GameResult[] = [];

  games.forEach( (game:Game)=>{
    let result = new GameResult(game);

    if (result.home_win === true) {
      homeTeamWin.push(result)
    }
    else if (result.home_win === false) {
      awayTeamWin.push(result);
    }

    if (result.home_cover === true) {
      homeTeamCover.push(result);
    }
    else if (result.away_cover === true) {
      awayTeamCover.push(result);
    }

    // favorite covers
    if (result.favorite_win === true) {
      favoriteCover.push(result);
      // count only no ties
      if ((result.home_1st + result.home_2nd) !== (result.away_1st + result.away_2nd)) {
        // favorite was Home
        if (result.favorite === 'Home') {
            // favorite is ahead
            if ((result.home_1st + result.home_2nd) > (result.away_1st + result.away_2nd)) {
              favoriteUpAtHalfCover.push(result);
            }
            else {
              underdogUpAtHalfLoss.push(result);
            }
        }
        // favorite was Away
        else {
          // favorite is ahead
          if ((result.away_1st + result.away_2nd) > (result.home_1st + result.home_2nd) ) {
            favoriteUpAtHalfCover.push(result);
          }
          else {
            underdogUpAtHalfLoss.push(result);
          }
        }
      }
    }
    // underdog covers
    else {
      underDogCover.push(result);
      if ((result.home_1st + result.home_2nd) !== (result.away_1st + result.away_2nd)) {
        // favorite was Home
        if (result.favorite === 'Home') {
          // favorite is ahead
          if ((result.home_1st + result.home_2nd) > (result.away_1st + result.away_2nd)) {
            favoriteUpAtHalfLoss.push(result);
          }
          else {
            underdogUpAtHalfCover.push(result);
          }
        }
        else {
          // favorite is ahead
          if ((result.away_1st + result.away_2nd) > (result.home_1st + result.home_2nd)) {
            favoriteUpAtHalfLoss.push(result);
          }
          else {
            underdogUpAtHalfCover.push(result);
          }
        }
      }
    }

    // (firstLine.ML === line.ML) ? null : (firstLine.ML < line.ML) ? (firstLine.Final > line.Final) : (firstLine.Final < line.Final)

    // if (!_.isNull(result.cover)) {
    //   if (result.cover) {
    //     homeTeamCover.push(game);
    //   }
    //   else {
    //     awayTeamCover.push(game);
    //   }
    // }
    
  });

  console.log(`Win rate of home team ${formatFloat(homeTeamWin.length / results.length * 100)}`);
  console.log(`Win rate of away team ${formatFloat(awayTeamWin.length / results.length * 100)}`);
  console.log(`Cover rate of favorite team ${formatFloat(favoriteCover.length / results.length * 100)}`);
  console.log(`Cover rate of underdog team ${formatFloat(underDogCover.length / results.length * 100)}`);
  console.log(`--------------------`);
  console.log(`Cover rate of favorite up at half time ${formatFloat(favoriteUpAtHalfCover.length / results.length * 100)}`);
  console.log(`Cover rate of underdog up at half time ${formatFloat(underdogUpAtHalfCover.length / results.length * 100)}`);
  console.log(`Loss rate of favorite up at half time ${formatFloat(favoriteUpAtHalfLoss.length / results.length * 100)}`);
  console.log(`Loss rate of underdog up at half time ${formatFloat(underdogUpAtHalfLoss.length / results.length * 100)}`);
}

export async function run() {

  let firstLine: any;
  let current: Game;
  let games: Game[] = [];
  let i = 0;

  await openNFLStatsCsv(`C:\\Users\\Andrew Hedges\\Downloads\\nfl_odds_2020_21.csv`, (line: any) => {
    line = convertLineToNumbers(line);

    if (i++ == 1) {
      // firstLine is always Vistor, line is always Home
      current.home = line.Team;
      current.home_money_line = line.ML;
      current.home_1st = line['1st'];
      current.home_2nd = line['2nd'];
      current.home_3rd = line['3rd'];
      current.home_4th = line['4th'];
      current.home_final = line.Final;

      // the favorites have swapped (Home was favored, NOW Away)
      if ((firstLine.Open > line.Open) && (line.Close > firstLine.Close)) {
        // firstline OPEN is OU and CLOSE is points / this line OPEN is points and CLOSE is OU
        current.total_open = firstLine.Open;
        current.total_close = line.Close;

        current.away_odds_open = line.Open;
        current.home_odds_open = line.Open * -1;
        current.away_odds_close = firstLine.Close * -1;
        current.home_odds_close = firstLine.Close;

      }
      // the favorites have swapped (Away was favored, NOW Home)
      else if ((firstLine.Open < line.Open) && (line.Close < firstLine.Close)) {
        // firstline OPEN is points and CLOSE is OU / this line OPEN is OU and CLOSE is points
        current.total_open = line.Open;
        current.total_close = firstLine.Close;

        current.away_odds_open = firstLine.Open * -1;
        current.home_odds_open = firstLine.Open;
        current.away_odds_close = line.Close;
        current.home_odds_close = line.Close * -1;
      }
      else {
        // firstline is OU / this line is favorite and is points
        if (firstLine.Open > line.Open) {
          current.total_open = firstLine.Open;
          current.total_close = firstLine.Close;

          current.away_odds_open = line.Open;
          current.home_odds_open = line.Open * -1;
          current.away_odds_close = line.Close;
          current.home_odds_close = line.Close * -1;
        }
        // firstline is favorite and is points / this line is OU
        else {
          current.total_open = line.Open;
          current.total_close = line.Close;

          current.away_odds_open = firstLine.Open * -1;
          current.home_odds_open = firstLine.Open;
          current.away_odds_close = firstLine.Close * -1;
          current.home_odds_close = firstLine.Close;
        }
      }

      // firstline is OU / this line is favorite and is points
      if (firstLine['2H'] > line['2H']) {
        current.second_total = firstLine['2H'];

        current.second_away_odds = line['2H'];
        current.second_home_odds = line['2H'] * -1;
      }
      // firstline is favorite and is points / this line is OU
      else {
        current.second_total = line['2H'];

        current.second_away_odds = firstLine['2H'] * -1;
        current.second_home_odds = firstLine['2H'];
      }

      current.home_win = (line.Final === firstLine.Final) ? null : (line.Final > firstLine.Final);
      current.favorite_win = (firstLine.ML === line.ML) ? null : (firstLine.ML < line.ML) ? (firstLine.Final > line.Final) : (firstLine.Final < line.Final);
      current.favorite = (firstLine.ML === line.ML) ? null : (firstLine.ML < line.ML ) ? (firstLine.VH ==='H' ? 'Home' : 'Away') : (line.VH==='H' ? 'Home' : 'Away');

      games.push(current);
      i = 0;
    }
    else {
      firstLine = line;
      current = new Game(line);
    }

    return line;
  });

  let season = await NFLSeason(false);

  // add in stats
  let combined = games.map( (game:any) => {

    // find in season by home and away
    let foundGame = _.find(season.json,(lookup)=>{
      return lookup.away.name === game.away && lookup.home.name === game.home;
    });

    if (!foundGame) {
      let err = `Can't find ${game.away} @ ${game.home}`;
      console.error(err);
      throw err;
    }

    game.id = foundGame.id;
    game.week = foundGame.week;
    game.scheduled = foundGame.scheduled;

    return game;
  });

  doCalcs(combined);

  // // write out the conversion to csv
  // let csv: string = convertToCsv(combined, { fields });
  // if (csv !== '') {
  //   Logger.debug(`Creating csv file from this week's odds`);
  //   // create the odds file
  //   await outputToFile(createDatedFileName('seasonOddsAndResults.csv'), csv);
  //   Logger.info(`Created Season Odds and Results successfully`);
  // }

}
