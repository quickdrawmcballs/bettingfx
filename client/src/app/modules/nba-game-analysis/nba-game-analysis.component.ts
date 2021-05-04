import { Component, OnDestroy, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SelectedGameService } from 'src/app/components/upcoming-nba-games-stats-table-no-frills/selected-game.service';
import { UPCOMING_GAME_STATS } from '../../../../../models/teams';

import { MomentPipe } from '../../pipes/app.pipe.momentpipe';


@Component({
  selector: 'app-nba-game-analysis',
  templateUrl: './nba-game-analysis.component.html',
  styleUrls: ['./nba-game-analysis.component.less']
})
export class NbaGameAnalysisComponent implements OnInit, OnDestroy {

  @HostBinding('class.is-open') isOpen = false; 

  private _routeSub: Subscription;
  
  title = '';
  active = 1;
  
  // private navigate

  constructor(
    private route: ActivatedRoute,
    private selectedGameService: SelectedGameService,
    private momentConvert: MomentPipe,
    private router: Router) { }

  ngOnInit(): void {
    // this._nbaSub = this.loadGameServiceService.getUpdates()
    // .subscribe( (game:UPCOMING_GAME_STATS) => {
    //   this.isOpen = Boolean(game);
    //   this.title = `${game.away} vs ${game.home}`

    // });

    // (data: any)
    // (data: { game: UPCOMING_GAME_STATS })
    // this._routeSub = this.route.data.pipe(take(1)).subscribe( (data: any) => {
    //   // this.isOpen = Boolean(data.game);
    //   // if (this.isOpen) {
    //   //   this.title = `${data.game.away} vs ${data.game.home}`;
    //   //   // go once
    //   //   this.router.navigate(['/analyze','home']);
    //   // }
    //   // else {
    //   //   this.title = '';
    //   // }

    //   this.title = `${data.game.away} vs ${data.game.home}`;
    //   this.router.navigate(['/analyze','home']);

    //   this._routeSub = this.selectedGameService.getData().subscribe( (game : UPCOMING_GAME_STATS) => {
    //     this.title = `${game.away} vs ${game.home}`;
    //     this.router.navigate(['/analyze','home']);
    //   });
    // });

    this._routeSub = this.route.paramMap.subscribe((inputMap: ParamMap)=>{
      if (!this.selectedGameService.data) {
        // this.router.navigate(['../', {}, { relativeTo: this.route}]);
        this.router.navigate(['/nba']);
      }
      else {
        this.title = `${this.selectedGameService.data.away} vs ${this.selectedGameService.data.home}`;
        this.router.navigate(['/nba/analyze','home']);
      }
      // if (inputMap.keys.length===0) {

      // }
      // else {

      // }
      // if (inputMap)
    });
  }

  ngOnDestroy(): void {
    // this._nbaSub.unsubscribe();
    this._routeSub.unsubscribe();
  }


}
