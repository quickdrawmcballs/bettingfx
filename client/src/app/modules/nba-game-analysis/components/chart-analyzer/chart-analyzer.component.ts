import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-chart-analyzer',
  templateUrl: './chart-analyzer.component.html',
  styleUrls: ['./chart-analyzer.component.less']
})
export class ChartAnalyzerComponent implements OnInit {

  active = 'top';
  
  constructor(
    private route: ActivatedRoute
  ) { 
    
  }

  ngOnInit(): void {
    // this.route.params.subscribe((input:any) => {
    //   let i = 1;
    // })
    this.route.paramMap.subscribe((inputMap:any)=>{
      let i = inputMap.get('team');
    });
    
  }

}
