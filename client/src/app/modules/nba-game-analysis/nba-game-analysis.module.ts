import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NbaGameAnalysisRoutingModule } from './nba-game-analysis-routing.module';
import { NbaGameAnalysisComponent } from './nba-game-analysis.component';
import { ChartAnalyzerComponent } from './components/chart-analyzer/chart-analyzer.component';
import { ScoringChartComponent } from './components/scoring-chart/scoring-chart.component';
import { MomentPipe } from 'src/app/pipes/app.pipe.momentpipe';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    
    NbaGameAnalysisRoutingModule
  ],
  declarations: [NbaGameAnalysisComponent, ChartAnalyzerComponent, ScoringChartComponent],
  exports: [NbaGameAnalysisComponent],
  providers: [MomentPipe]
})
export class NbaGameAnalysisModule { }
