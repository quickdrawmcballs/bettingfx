import axios, { AxiosRequestConfig } from 'axios';
import _ from 'lodash';

import { Config } from '../config';
import { Logger } from '../logging';

// const preURL = "https://api.the-odds-api.com/v3/odds/";
const preURL = 'https://api.the-odds-api.com/v4/sports/{{sport}}/odds';
            // 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds'
// const apiKey:string = Config.theOddsApi.apiKey;
// const region = "us";
// const mkt="spreads";

// const example = "GET /v3/odds/?sport={sport}&region={region}&mkt={mkt}&apiKey={apiKey}&dateFormat={iso}&oddsFormat={american}";
// const real_example = "GET /v3/odds/?apiKey={e0d683c85101317f19092fa48f290ec9}&sport={americanfootball_nfl}&region={us}&mkt={spreads}";
// GET / v4 / sports / americanfootball_nfl / odds ? regions = us & oddsFormat=american & apiKey=YOUR_API_KEY

const Markets = 'h2h,spreads,totals'; //_.keyBy(['spreads'],key=>key);

export const getOddsSpread = (sport?: string) => request(buildOddsUrl(sport),buildOddsRequest(Markets));

function buildOddsRequest(markets:string=Markets): any {
  return _.merge({}, Config.theOddsApi, { markets} );
}

function buildOddsUrl(sport: string = 'americanfootball_nfl') {
  return _.replace(preURL,'{{sport}}',sport);
}

async function request(url:string,params:any) : Promise<any> {
  let requestConfig:AxiosRequestConfig = {
    method: 'GET',
    url,
    params
  };

  try {
    Logger.info(`Attempting GET: ${url}`);
    let resp = await axios(requestConfig);
    // Check your usage
    Logger.info(`Used requests ${resp.headers['x-requests-used']}. Remaining requests ${resp.headers['x-requests-remaining']}`);

    return resp;
  } catch (err) {
    Logger.error(`${url} has failed. ${err.toString()}`);
  }
}