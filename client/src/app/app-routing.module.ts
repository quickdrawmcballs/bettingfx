import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NbaGamesComponent } from './components/nba-games/nba-games.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

import { GameSelectedResolverService } from './resolvers/game-selected-resolver.service';

const routes: Routes = [
  {
    path: '', redirectTo: '/nba', pathMatch: 'full'
  },
  { 
    path: 'nba',
    component: NbaGamesComponent,
    children: [
      // { path: '',   redirectTo: '../', pathMatch: 'full' },
      { 
        path: 'analyze',
        loadChildren: () => import('./modules/nba-game-analysis/nba-game-analysis.module').then(m => m.NbaGameAnalysisModule),
        resolve: {
          game: GameSelectedResolverService
        }
      }
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
