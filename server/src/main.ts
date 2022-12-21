import _ from 'lodash';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Logger } from './logging';
import { doOdds } from './utils/oddsEngine';
import { doSeason as NFLSeason } from './nfl/statsRetreiver';
import { dfdTest, train } from './nfl/mlEngine';
import { calc } from './nba/statsEngine';
import { getPlayedGames as NBASeason } from './nba/statsRetreiver';
import { doSeason as MLBSeason } from './mlb/statsRetreiver';
import { run as statOdds } from './nfl/statsOdds';

const argv = yargs(hideBin(process.argv)).argv;
const dateFormat = 'MM/D h:mm A';

interface Game {
  date: string;
  home_team: string;
  away_team: string;
  odds_source?: string;
  odds_last_update?: string;
  odds_spread?: string;
  odds_vig?: string;
}

async function run() {
  let mode = _.get(argv,['_','0']);

  if (_.isEqual(mode,'dfd')) {
    Logger.info(`Tensor Flow...`);
    dfdTest();
    // train();
  }
  else if (_.isEqual(mode,'nfl_odds')) {
    let refresh = (/true/i).test(String(_.get(argv,'refresh')));
    Logger.info(`Running NFL odds... Refresh:${refresh}`);
    doOdds({sport:'americanfootball_nfl',display:'nfl'},refresh);
  }
  else if (_.isEqual(mode,'nba_odds')) {
    let refresh = (/true/i).test(String(_.get(argv,'refresh')));
    Logger.info(`Running NBA odds... Refresh:${refresh}`);
    doOdds({sport:'basketball_nba',display:'nba'},refresh);
  }
  else if (_.isEqual(mode,'nfl_season')) {
    let refresh = (/true/i).test(String(_.get(argv,'refresh')));
    Logger.info(`Running season... Refresh:${refresh}`);
    NFLSeason(refresh);
  }
  else if (_.isEqual(mode,'nba_season')) {
    let refresh = (/true/i).test(String(_.get(argv,'refresh')));
    let season = _.get(argv,'season') as string | undefined;
    let year = _.get(argv,'year') as string | undefined;
    Logger.info(`Running ${year||'2021'} ${season||'REG'} season... Refresh:${refresh}`);
    NBASeason(refresh,year,season);
  }
  else if (_.isEqual(mode,'nba_play')) {
    let refresh = (/true/i).test(String(_.get(argv,'refresh')));
    Logger.info(`NBA Stats...`);
    calc(refresh);
  }
  else if (_.isEqual(mode,'mlb_season')) {
    let refresh = (/true/i).test(String(_.get(argv,'refresh')));
    Logger.info(`MLB Stats...`);
    MLBSeason(refresh);
  }
  else if (_.isEqual(mode, 'stats_odds')) {
    // let refresh = (/true/i).test(String(_.get(argv, 'refresh')));
    Logger.info(`NFL Stat & Odds...`);
    statOdds();
  }
  
  else {
    Logger.warn(`No mode is set. Exiting`);
  }
}

run();