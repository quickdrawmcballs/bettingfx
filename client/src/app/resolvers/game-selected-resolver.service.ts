import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

import { SelectedGameService } from '../components/upcoming-nba-games-stats-table-no-frills/selected-game.service';

import { UPCOMING_GAME_STATS } from '../../../../models/teams';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameSelectedResolverService implements Resolve<UPCOMING_GAME_STATS> {

  constructor(private selectedGameService: SelectedGameService) {}

  resolve() : Observable<UPCOMING_GAME_STATS> {
    return of (this.selectedGameService.data);
  }
}
