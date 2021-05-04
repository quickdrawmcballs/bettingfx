import { TestBed } from '@angular/core/testing';

import { GameSelectedResolverService } from './game-selected-resolver.service';

describe('GameSelectedResolverService', () => {
  let service: GameSelectedResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameSelectedResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
