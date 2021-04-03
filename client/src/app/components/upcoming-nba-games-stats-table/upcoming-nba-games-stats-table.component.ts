import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { NbaService } from 'src/app/services/nba-games.service';
import { UpcomingGameStats } from 'src/app/models/nba-stats.model';

@Component({
  selector: 'app-upcoming-nba-games-stats-table',
  templateUrl: './upcoming-nba-games-stats-table.component.html',
  styleUrls: ['./upcoming-nba-games-stats-table.component.less']
})
export class UpcomingNbaGamesStatsTableComponent implements OnInit, OnDestroy, AfterViewInit {
  private _nbaSub: Subscription;

  // 'time',
  columnsToDisplay = ['date', 'home', 'homeSeason.hwPerc', 'homeSeason.downAtHalfWinPerc',
    'away', 'awaySeason.hwPerc', 'awaySeason.downAtHalfWinPerc', 'odds_spread', 'odds_vig'];
  dataSource = new MatTableDataSource<UpcomingGameStats>([]);

  constructor(private nbaService: NbaService) { }

  ngOnInit(): void {
    this._nbaSub = this.nbaService.upcomingGamesStats
    .subscribe( (data:UpcomingGameStats[]) => {
      console.log(`Retreived Games Successfully`);
      this.dataSource.data = data;
    });

    this.nbaService.getUpcomingGAmes();
  }

  ngOnDestroy() {
    this._nbaSub.unsubscribe();
  }

  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}

let ELEMENT_DATA: UpcomingGameStats[] = [];
