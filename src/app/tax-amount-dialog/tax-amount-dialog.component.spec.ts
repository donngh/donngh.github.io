import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxAmountDialogComponent } from './tax-amount-dialog.component';

describe('TaxAmountDialogComponent', () => {
  let component: TaxAmountDialogComponent;
  let fixture: ComponentFixture<TaxAmountDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxAmountDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxAmountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
