import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingNbaGamesStatsTableComponent } from './upcoming-nba-games-stats-table.component';

describe('UpcomingNbaGamesStatsTableComponent', () => {
  let component: UpcomingNbaGamesStatsTableComponent;
  let fixture: ComponentFixture<UpcomingNbaGamesStatsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpcomingNbaGamesStatsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingNbaGamesStatsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
