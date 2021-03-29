import { TestBed } from '@angular/core/testing';

import { NbaGamesService } from './nba-games.service';

describe('NbaGamesService', () => {
  let service: NbaGamesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NbaGamesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
