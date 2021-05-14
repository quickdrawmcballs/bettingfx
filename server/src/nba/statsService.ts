import { UPCOMING_GAME_STATS } from '../../../models/teams';

import { getUpcomingGameStats as _getUpcomingGameStats, getTeamStats as _getTeamStats } from './statsEngine';

let cache:Map<string, any> = new Map<string, any>();

export async function getUpcomingGameStats(options:{noCache?:boolean,refreshFromSource?:boolean}={noCache:false,refreshFromSource:false}) : Promise<UPCOMING_GAME_STATS[]>{
    if (!options.noCache && cache.has('upcomingGames')) {
        return cache.get('upcomingGames') as UPCOMING_GAME_STATS[];
    }
    else {
        let retVal:UPCOMING_GAME_STATS[] = await _getUpcomingGameStats(options.refreshFromSource);
        cache.set('upcomingGames',retVal);
        return retVal;
    }
}

export async function getTeamStats(options:{noCache?:boolean,team:string}={noCache:false,team:''}) : Promise<any> {
    if (!options.noCache && cache.has('teamStats') && cache.get('teamStats').has(options.team)) {
        return cache.get('teamStats').get(options.team);
    }

    if (options.noCache || !cache.has('upcomingGames')) {
        cache.set('upcomingGames', await _getUpcomingGameStats());
    }

    if (!cache.has('teamStats')) {
        cache.set('teamStats', new Map<string, any>());
    }

    let teamStats;
    if (options.noCache || !cache.get('teamStats').has(options.team)) {
        teamStats = await _getTeamStats(options.team,cache.get('upcomingGames'));
        // put in cache
        cache.get('teamStats').set(options.team,teamStats);
    }

   return cache.get('teamStats').get(options.team);
}
