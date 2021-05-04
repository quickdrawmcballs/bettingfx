import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Sort } from '@angular/material/sort';

import { Subscription } from 'rxjs';

import { NbaService } from 'src/app/services/nba-games.service';
import { SelectedGameService } from './selected-game.service';
import { LoadGameServiceService } from 'src/app/modules/nba-game-analysis/services/load-game-service.service';

import { UPCOMING_GAME_STATS } from '../../../../../models/lib/teams';

@Component({
  selector: 'app-upcoming-nba-games-stats-table-no-frills',
  templateUrl: './upcoming-nba-games-stats-table-no-frills.component.html',
  styleUrls: ['./upcoming-nba-games-stats-table-no-frills.component.less']
})
export class UpcomingNbaGamesStatsTableNoFrillsComponent implements OnInit, OnDestroy, AfterViewInit {

  private _nbaSub: Subscription;

  dataSource = new MatTableDataSource<UPCOMING_GAME_STATS>([]);
  sortedData: UPCOMING_GAME_STATS[] = [];

  constructor(private nbaService: NbaService,
              private selectedGameService: SelectedGameService,
              private loadGameServiceService: LoadGameServiceService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this._nbaSub = this.nbaService.upcomingGamesStats
    .subscribe( (data:UPCOMING_GAME_STATS[]) => {
      console.log(`Retreived Upcoming Games Successfully`);
      this.dataSource.data = data;
      this.sortedData = data.slice();
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
    this.sortData(this.sort);
  }

  sortData(sort: Sort) {
    const data = this.dataSource.filteredData.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }
    
    this.sortedData = data.sort((a:any,b:any)=>{
      return compare(a[sort.active],b[sort.active],sort.direction==='asc');
    });
  }

  // deprecated function
  sortData2(sort: Sort) {
    // const data = this.dataSource.filteredData.slice();
    // if (!sort.active || sort.direction === '') {
    //   this.sortedData = data;
    //   return;
    // }

    // this.sortedData = data.sort((a:any, b:any) =>{
    //   return compare(a[sort.active],b[sort.active],sort.direction==='asc');
    // });
    // this.dataSource.sort = this.sort;
    // this.dataSource.sort?.sort(sort);
    if (!sort.active || sort.direction === '') {
      // this.dataSource.sort?.sort({id:'',start:'asc',disableClear : false});
      // this.sort.sort({ id: 'date', start: 'desc', disableClear: false });
      this.dataSource.sort?.sort({ id: 'date', start: 'asc', disableClear: false });
    }
    else {

      this.dataSource.data.sort((a:any,b:any)=>{
            // const data = this.dataSource.filteredData.slice();
      // if (!sort.active || sort.direction === '') {
      //   this.sortedData = data;
      //   return;
      // }

        return compare(a[sort.active],b[sort.active],sort.direction==='asc');
      });
    }
  }

  rowSelected(game_stats:UPCOMING_GAME_STATS) {
    // this.loadGameServiceService.send(game_stats);
    this.selectedGameService.send(game_stats);
    this.router.navigate(['/nba/analyze',{away: game_stats.away}]);
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
