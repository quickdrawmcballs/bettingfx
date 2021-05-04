import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartAnalyzerComponent } from './chart-analyzer.component';

describe('ChartAnalyzerComponent', () => {
  let component: ChartAnalyzerComponent;
  let fixture: ComponentFixture<ChartAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartAnalyzerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
