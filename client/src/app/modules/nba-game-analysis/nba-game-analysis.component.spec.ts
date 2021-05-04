import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaGameAnalysisComponent } from './nba-game-analysis.component';

describe('NbaGameAnalysisComponent', () => {
  let component: NbaGameAnalysisComponent;
  let fixture: ComponentFixture<NbaGameAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NbaGameAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NbaGameAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
