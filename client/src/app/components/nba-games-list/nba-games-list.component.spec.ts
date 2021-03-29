import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbaGamesListComponent } from './nba-games-list.component';

describe('NbaGamesListComponent', () => {
  let component: NbaGamesListComponent;
  let fixture: ComponentFixture<NbaGamesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NbaGamesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NbaGamesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
