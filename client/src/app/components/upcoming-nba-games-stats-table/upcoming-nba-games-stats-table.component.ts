import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { NbaService } from 'src/app/services/nba-games.service';
import { UPCOMING_GAME_STATS } from '../../../../../models/lib/teams';

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
  dataSource = new MatTableDataSource<UPCOMING_GAME_STATS>([]);

  constructor(private nbaService: NbaService) { }

  ngOnInit(): void {
    this._nbaSub = this.nbaService.upcomingGamesStats
    .subscribe( (data:UPCOMING_GAME_STATS[]) => {
      console.log(`Retreived Upcoming Games Successfully`);
      this.dataSource.data = data;
    });

    this.nbaService.getUpcomingGames();
  }

  ngOnDestroy() {
    this._nbaSub.unsubscribe();
  }

  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
