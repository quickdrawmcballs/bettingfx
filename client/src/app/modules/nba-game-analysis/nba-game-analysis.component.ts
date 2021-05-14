import { Component, OnDestroy, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SelectedGameService } from 'src/app/components/upcoming-nba-games-stats-table-no-frills/selected-game.service';


@Component({
  selector: 'app-nba-game-analysis',
  templateUrl: './nba-game-analysis.component.html',
  styleUrls: ['./nba-game-analysis.component.less']
})
export class NbaGameAnalysisComponent implements OnInit, OnDestroy {

  @HostBinding('class.is-open') isOpen = false; 

  private _routeSub: Subscription;
  
  title = '';
  home = '';
  away = '';

  active = 1;
  
  // private navigate

  constructor(
    private route: ActivatedRoute,
    private selectedGameService: SelectedGameService,
    private router: Router) { }

  ngOnInit(): void {
    this._routeSub = this.route.paramMap.subscribe((inputMap: ParamMap)=>{
      if (!this.selectedGameService.data) {
        // this.router.navigate(['../', {}, { relativeTo: this.route}]);
        this.router.navigate(['/nba']);
      }
      else {
        this.title = `${this.selectedGameService.data.away} vs ${this.selectedGameService.data.home}`;
        this.home = this.selectedGameService.data.home;
        this.away = this.selectedGameService.data.away;
        this.router.navigate(['/nba/analyze',this.home]);
      }
    });
  }

  ngOnDestroy(): void {
    // this._nbaSub.unsubscribe();
    this._routeSub.unsubscribe();
  }


}
