import { TestBed } from '@angular/core/testing';

import { SizeChartsService } from './size-charts.service';

describe('SizeChartsService', () => {
  let service: SizeChartsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SizeChartsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
