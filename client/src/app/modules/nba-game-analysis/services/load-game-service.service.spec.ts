import { TestBed } from '@angular/core/testing';

import { LoadGameServiceService } from './load-game-service.service';

describe('LoadGameServiceService', () => {
  let service: LoadGameServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadGameServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
