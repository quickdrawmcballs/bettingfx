import axios, { AxiosRequestConfig } from 'axios';

import { Config } from '../config';
import { Logger } from '../logging';

const api_key:string = Config.sportRadar.nfl_api;
const ret_format:string = Config.sportRadar.format; //'.json';

const statics = {
  year: '2020',
  nfl_season: 'reg',
  nfl_season_week: '7'
}

const preURL = "http://api.sportradar.us/nfl/official/trial/v6/en/";


/// Export Section
export const getWeeklySchedule = (week:number | string) => request(buildWeeklySchedule(week));
export const getSchedule = (year?:string,season?:string) => request(buildSchedule(year,season));
export const getGameStats = (gameId:string) => request(buildGameStats(gameId));



function buildURL(endpoint:string,...opts:string[]): string {
  return preURL + opts.join('/') + '/' + endpoint + '.' + ret_format;
}

/**
 * buildWeeklySchedule - 
 * ex: http://api.sportradar.us/nfl/official/trial/v6/en/games/2020/REG/1/schedule.json?api_key=
 * @param week 
 * @returns string
 */
function buildWeeklySchedule(week:number | string) : string {
  return preURL + 'games/' + statics.year + '/' + statics.nfl_season + '/' + statics.nfl_season_week + '/schedule.json';
}

/**
 * buildBoxScore - 
 * ex: http://api.sportradar.us/nfl/official/trial/v6/en/games/0e00303b-ee60-4cf4-ad68-48efbe53901d/boxscore.json?api_key=
 * @param game_id 
 * @returns string
 */
function buildBoxScore(game_id:string) : string {
  return buildURL('boxscore','games',game_id);
}

/**
 * buildSchedule
 * ex: http://api.sportradar.us/nfl/official/trial/v6/en/games/2020/REG/schedule.json?api_key=
 * 
 * @param year schedule year (defaults: 2020)
 * @param season season (PRE,REG,PST, defaults: REG)
 * @returns string
 */
function buildSchedule(year:string='2020',season:string='REG') : string {
  return buildURL('schedule','games',year,season);
} 

/**
 * buildGameStats
 * ex: http://api.sportradar.us/nfl/official/trial/v6/en/games/018556f9-1977-4a0b-8244-20cad15df9a4/statistics.json?api_key=
 * 
 * @param game_id
 * @returns string
 */
function buildGameStats(game_id:string): string {
  if (!game_id) throw new Error(`Can't retreive games stats for empty game_id`);

  return buildURL('statistics','games',game_id);
}

async function request(url:string) : Promise<any> {
  let requestConfig:AxiosRequestConfig = {
    method: 'GET',
    url,
    params: { api_key }
  };

  try {
    // return axios(requestConfig);
    let resp = await axios(requestConfig);

    // X-Plan-Quota-Allotted: 1000
    // X-Plan-Quota-Current: 2
    let alloted = Number(resp.headers['x-plan-quota-allotted']||0);
    let used = Number(resp.headers['x-plan-quota-current']||0);

    // Check your usage
    Logger.info(`Used requests ${used}. Remaining requests ${alloted - used}`);

    return resp;
  } catch (err) {
    console.error(`${url} has failed. ${err.toString()}`);
  }
}