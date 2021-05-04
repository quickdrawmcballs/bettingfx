import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaGamesComponent } from './nba-games.component';

describe('NbaGamesComponent', () => {
  let component: NbaGamesComponent;
  let fixture: ComponentFixture<NbaGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NbaGamesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NbaGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
