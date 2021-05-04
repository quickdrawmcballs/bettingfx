import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';


// import { NBASeason } from '../models/nba-season.model';
import { UPCOMING_GAME_STATS, NbaOdds } from '../../../../models/lib/teams';


@Injectable({
  providedIn: 'root'
})
export class NbaService {

  oddsNBA = this.socket.fromEvent<NbaOdds[]>('oddsNBA');
  seasonNBA = this.socket.fromEvent<{csv:string,json:any}>('seasonNBA');
  upcomingGamesStats = this.socket.fromEvent<UPCOMING_GAME_STATS[]>('UpcomingNBAGamesStats')

  constructor(private socket: Socket) { }

  updateOdds(refresh:boolean=true) {
    this.socket.emit('refresh-nba-odds',refresh);
  }

  updateSeason(refresh:boolean=true) {
    this.socket.emit('refresh-nba-season',refresh);
  }

  getUpcomingGames(refresh:boolean=false) {
    this.socket.emit('nba-upcoming-games-stats',refresh)
  }
}
