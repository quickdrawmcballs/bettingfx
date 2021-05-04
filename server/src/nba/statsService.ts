import { UPCOMING_GAME_STATS } from '../../../models/teams';

import { getUpcomingGameStats as _getUpcomingGameStats } from './statsEngine';

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
