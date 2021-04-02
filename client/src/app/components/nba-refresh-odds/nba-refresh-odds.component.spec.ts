import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaRefreshOddsComponent } from './nba-refresh-odds.component';

describe('NbaRefreshOddsComponent', () => {
  let component: NbaRefreshOddsComponent;
  let fixture: ComponentFixture<NbaRefreshOddsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NbaRefreshOddsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NbaRefreshOddsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
