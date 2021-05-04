import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nba-game-chart-analyzer',
  templateUrl: './nba-game-chart-analyzer.component.html',
  styleUrls: ['./nba-game-chart-analyzer.component.less']
})
export class NbaGameChartAnalyzerComponent implements OnInit {

  active = 'top';

  constructor() { }

  ngOnInit(): void {
  }

}
