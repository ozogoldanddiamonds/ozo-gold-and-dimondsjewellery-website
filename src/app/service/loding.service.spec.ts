import { TestBed } from '@angular/core/testing';

import { LodingService } from './loding.service';

describe('LodingService', () => {
  let service: LodingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LodingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
