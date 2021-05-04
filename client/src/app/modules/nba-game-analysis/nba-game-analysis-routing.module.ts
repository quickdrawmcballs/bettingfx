import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from 'src/app/components/page-not-found/page-not-found.component';

import { ChartAnalyzerComponent } from './components/chart-analyzer/chart-analyzer.component';
import { NbaGameAnalysisComponent } from './nba-game-analysis.component';

const routes: Routes = [
  { 
    path: '', 
    component: NbaGameAnalysisComponent,
    children: [
      { 
        path: ':team', 
        component: ChartAnalyzerComponent
      },
      { path: '**', component: PageNotFoundComponent }
    ]
  }
  // { path: 'analyze/chart', component: ChartAnalyzerComponent, outlet: 'chart', pathMatch: 'full'},
  // { 
  //   path: '',
  //   redirectTo: '/analyze:team;team=home',
  //   pathMatch: 'full'
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NbaGameAnalysisRoutingModule { }
