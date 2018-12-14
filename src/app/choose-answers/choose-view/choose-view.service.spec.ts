import { TestBed } from '@angular/core/testing';

import { ChooseViewService } from './choose-view.service';

describe('ChooseViewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChooseViewService = TestBed.get(ChooseViewService);
    expect(service).toBeTruthy();
  });
});
