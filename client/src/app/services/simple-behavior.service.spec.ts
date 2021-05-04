import { TestBed } from '@angular/core/testing';

import { SimpleBehaviorService } from './simple-behavior.service';

describe('SimpleBehaviorService', () => {
  let service: SimpleBehaviorService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimpleBehaviorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
