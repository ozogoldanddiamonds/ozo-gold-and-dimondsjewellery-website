import { TestBed } from '@angular/core/testing';

import { CustomdesignService } from './customdesign.service';

describe('CustomdesignService', () => {
  let service: CustomdesignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomdesignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
