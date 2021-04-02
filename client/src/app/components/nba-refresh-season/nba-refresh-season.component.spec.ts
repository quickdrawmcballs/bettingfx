import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaRefreshSeasonComponent } from './nba-refresh-season.component';

describe('NbaRefreshSeasonComponent', () => {
  let component: NbaRefreshSeasonComponent;
  let fixture: ComponentFixture<NbaRefreshSeasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NbaRefreshSeasonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NbaRefreshSeasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
