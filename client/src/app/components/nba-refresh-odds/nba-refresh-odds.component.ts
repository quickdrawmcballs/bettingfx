import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { NbaService } from 'src/app/services/nba-games.service';
import { NbaOdds } from '../../../../../models/lib/teams';

@Component({
  selector: 'app-nba-refresh-odds',
  templateUrl: './nba-refresh-odds.component.html',
  styleUrls: ['./nba-refresh-odds.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NbaRefreshOddsComponent implements OnInit, OnDestroy {
  private _nbaSub: Subscription;

  constructor(private nbaService: NbaService) { }

  ngOnInit(): void {
    this._nbaSub = this.nbaService.oddsNBA
    .subscribe( (data:NbaOdds[]) => {
      console.log(`Refresh of Odds Successful`);
    });
  }
  ngOnDestroy() {
    this._nbaSub.unsubscribe();
  }
  refreshOdds() {
    this.nbaService.updateOdds();
  }
}
