import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { NBAOdds } from '../models/nba-odds.model';
import { NBASeason } from '../models/nba-season.model';
import { UpcomingGameStats } from '../models/nba-stats.model';


@Injectable({
  providedIn: 'root'
})
export class NbaService {

  oddsNBA = this.socket.fromEvent<NBAOdds[]>('oddsNBA');
  seasonNBA = this.socket.fromEvent<NBASeason[]>('seasonNBA');
  upcomingGamesStats = this.socket.fromEvent<UpcomingGameStats[]>('UpcomingNBAGamesStats')

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
