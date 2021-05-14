import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { NbaService } from 'src/app/services/nba-games.service';

@Component({
  selector: 'app-chart-analyzer',
  templateUrl: './chart-analyzer.component.html',
  styleUrls: ['./chart-analyzer.component.less']
})
export class ChartAnalyzerComponent implements OnInit, OnDestroy {

  private _nbaSub: Subscription;
  private _currentTeam: string;

  active = 'season';
  
  constructor(
    private route: ActivatedRoute,
    private nbaService: NbaService
  ) {}

  ngOnInit(): void {
    // this.route.params.subscribe((input:any) => {
    //   let i = 1;
    // })
    this.route.paramMap.subscribe((inputMap:any)=>{
      this._currentTeam = inputMap.get('team');
      // get breakdown for Team
      this.nbaService.getTeamStats(inputMap.get('team'));
    });

    this._nbaSub = this.nbaService.upcomingGamesStats
    .subscribe( (data:any) => {
      console.log(`Retreived Upcoming Games Successfully`);
      // this.dataSource.data = data;
      this.team = data.team;
    });
  }

  ngOnDestroy(): void {
    this._nbaSub.unsubscribe();
  }

  onNavChange(changeEvent: NgbNavChangeEvent) : void {
    this.nbaService.getTeamStats(this._currentTeam);
  }
}
