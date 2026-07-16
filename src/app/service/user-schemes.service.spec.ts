import { TestBed } from '@angular/core/testing';

import { UserSchemesService } from './user-schemes.service';

describe('UserSchemesService', () => {
  let service: UserSchemesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSchemesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
