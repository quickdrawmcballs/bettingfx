import { OnDestroy, SimpleChanges } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import { Subscription } from 'rxjs';
import { NbaService } from 'src/app/services/nba-games.service';
import { SimpleService } from 'src/app/services/simple.service';

@Component({
  selector: 'app-scoring-chart',
  templateUrl: './scoring-chart.component.html',
  styleUrls: ['./scoring-chart.component.less']
})

export class ScoringChartComponent implements OnInit, OnDestroy {

  private _nbaSub: Subscription;

  private dataTest = [
    {'Framework': 'Vue', 'Stars': '166443', 'Released': '2014'},
    {'Framework': 'React', 'Stars': '150793', 'Released': '2013'},
    {'Framework': 'Angular', 'Stars': '62342', 'Released': '2016'},
    {'Framework': 'Backbone', 'Stars': '27647', 'Released': '2010'},
    {'Framework': 'Ember', 'Stars': '21471', 'Released': '2011'},
  ];
  private svg:any;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 300 - (this.margin * 2);

  @Input() tab:string;

  chartId:string = uuid.v4();

  data:any;

  constructor(private nbaService: NbaService) {}

  ngOnInit(): void {
    // this.createSvg();

    this._nbaSub = this.nbaService.upcomingGamesStats
    .subscribe( (data:any) => {
      console.log(`Retreived Team Stats Successfully`);
      this.data = data;
      this.update();
    });
  }
  ngOnDestroy(): void {
    this._nbaSub.unsubscribe();
  }
  ngOnChanges(changes:SimpleChanges) {
    if(!changes.tab.firstChange) {
      this.tab = changes.tab.currentValue;
      this.update();
    }
  }

  private update() {
    this.clearSvg();
    this.createSvg();

    if (this.tab) {
      if (this.tab === 'season') {
        this.drawBars( this.data.seasonWin );
      }
      else if (this.tab === 'last9') {
        this.drawBars( this.data.last9Win );
      }
    }
  }

  private clearSvg(): void {
    if (this.svg && !this.svg.empty()) {
      d3.select('figure#bar_'+this.chartId).selectAll("*").remove();
      // this.svg.selectAll('*').remove();
      // this.svg.remove();
    }
  }

  private createSvg(): void {
    this.svg = d3.select('figure#bar_'+this.chartId)
      .append('svg')
      .attr('id',this.chartId)
      .attr('width', this.width + (this.margin * 2))
      .attr('height', this.height + (this.margin * 2))
      .append('g')
      .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');
  }
  private drawBars(data: any[]): void {
    // Add X axis
    const x = d3.scaleBand()
      .range([0, this.width])
      // .domain(data.map(d => d.Framework))
      .domain(data.map(d => d.score))
      .padding(0.2);

    this.svg.append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 10])
      .range([this.height, 0]);

    this.svg.append('g')
      .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg.selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      // .attr('x', (d:any) => x(d.Framework))
      // .attr('y', (d:any) => y(d.Stars))
      .attr('x', (d:any) => x(d.score))
      .attr('y', (d:any) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d:any) => this.height - y(d.count))
      .attr('fill', '#d04a35');
  }

}
