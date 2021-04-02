import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { NBASeason } from 'src/app/models/nba-season.model';
import { NbaService } from 'src/app/services/nba-games.service';

@Component({
  selector: 'app-nba-refresh-season',
  templateUrl: './nba-refresh-season.component.html',
  styleUrls: ['./nba-refresh-season.component.less']
})
export class NbaRefreshSeasonComponent implements OnInit, OnDestroy {
  private _nbaSub: Subscription;

  constructor(private nbaService: NbaService) { }

  ngOnInit(): void {
    this._nbaSub = this.nbaService.oddsNBA
    .subscribe( (data:NBASeason[]) => {
      console.log(`Refresh of Nba Season Successful`);
    });
  }
  ngOnDestroy() {
    this._nbaSub.unsubscribe();
  }
  refreshSeason() {
    this.nbaService.updateSeason();
  }
}
