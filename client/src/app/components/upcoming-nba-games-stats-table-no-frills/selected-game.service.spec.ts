import { TestBed } from '@angular/core/testing';

import { SelectedGameService } from './selected-game.service';

describe('SelectedGameService', () => {
  let service: SelectedGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
