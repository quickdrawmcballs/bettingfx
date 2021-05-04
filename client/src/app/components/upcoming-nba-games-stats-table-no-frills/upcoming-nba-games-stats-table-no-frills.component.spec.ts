import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingNbaGamesStatsTableNoFrillsComponent } from './upcoming-nba-games-stats-table-no-frills.component';

describe('UpcomingNbaGamesStatsTableNoFrillsComponent', () => {
  let component: UpcomingNbaGamesStatsTableNoFrillsComponent;
  let fixture: ComponentFixture<UpcomingNbaGamesStatsTableNoFrillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpcomingNbaGamesStatsTableNoFrillsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingNbaGamesStatsTableNoFrillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
