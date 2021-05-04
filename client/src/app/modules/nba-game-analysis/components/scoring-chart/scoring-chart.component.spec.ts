import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoringChartComponent } from './scoring-chart.component';

describe('ScoringChartComponent', () => {
  let component: ScoringChartComponent;
  let fixture: ComponentFixture<ScoringChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScoringChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoringChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
