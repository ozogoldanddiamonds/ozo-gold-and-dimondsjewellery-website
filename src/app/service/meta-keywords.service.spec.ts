import { TestBed } from '@angular/core/testing';

import { MetaKeywordsService } from './meta-keywords.service';

describe('MetaKeywordsService', () => {
  let service: MetaKeywordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetaKeywordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
