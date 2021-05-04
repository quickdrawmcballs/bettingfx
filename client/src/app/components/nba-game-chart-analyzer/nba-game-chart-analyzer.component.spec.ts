import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaGameChartAnalyzerComponent } from './nba-game-chart-analyzer.component';

describe('NbaGameChartAnalyzerComponent', () => {
  let component: NbaGameChartAnalyzerComponent;
  let fixture: ComponentFixture<NbaGameChartAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NbaGameChartAnalyzerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NbaGameChartAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
