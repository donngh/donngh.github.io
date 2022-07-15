import { TestBed } from '@angular/core/testing';

import { DmiServiceService } from './dmi-service.service';

describe('DmiServiceService', () => {
  let service: DmiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DmiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
