import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheifpbComponent } from './ficheifpb.component';

describe('FicheifpbComponent', () => {
  let component: FicheifpbComponent;
  let fixture: ComponentFixture<FicheifpbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FicheifpbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FicheifpbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
