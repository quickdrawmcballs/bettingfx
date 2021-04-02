import { TestBed } from '@angular/core/testing';

import { ServerErrorsService } from './server-errors.service';

describe('ServerErrorsService', () => {
  let service: ServerErrorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerErrorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
