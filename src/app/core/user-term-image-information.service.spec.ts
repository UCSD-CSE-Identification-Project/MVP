import { TestBed } from '@angular/core/testing';

import { UserTermImageInformationService } from './user-term-image-information.service';

describe('UserTermImageInformationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserTermImageInformationService = TestBed.get(UserTermImageInformationService);
    expect(service).toBeTruthy();
  });
});
