import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTempMsgDialComponent } from './show-temp-msg-dial.component';

describe('ShowTempMsgDialComponent', () => {
  let component: ShowTempMsgDialComponent;
  let fixture: ComponentFixture<ShowTempMsgDialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowTempMsgDialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowTempMsgDialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
