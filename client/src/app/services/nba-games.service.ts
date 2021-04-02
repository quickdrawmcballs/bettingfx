import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { NBAOdds } from '../models/nba-odds.model';
import { NBASeason } from '../models/nba-season.model';


@Injectable({
  providedIn: 'root'
})
export class NbaService {
  
  oddsNBA = this.socket.fromEvent<NBAOdds[]>('oddsNBA');
  seasonNBA = this.socket.fromEvent<NBASeason[]>('seasonNBA');

  constructor(private socket: Socket) { }

  updateOdds(refresh:boolean=false) {
    this.socket.emit('refresh-nba-odds',refresh);
  }

  updateSeason(refresh:boolean=false) {
    this.socket.emit('refresh-nba-season',refresh);
  }
}
