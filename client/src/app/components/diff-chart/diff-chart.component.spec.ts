import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiffChartComponent } from './diff-chart.component';

describe('DiffChartComponent', () => {
  let component: DiffChartComponent;
  let fixture: ComponentFixture<DiffChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiffChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiffChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
