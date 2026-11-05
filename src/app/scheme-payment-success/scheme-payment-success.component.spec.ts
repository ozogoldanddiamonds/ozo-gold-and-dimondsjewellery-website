import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemePaymentSuccessComponent } from './scheme-payment-success.component';

describe('SchemePaymentSuccessComponent', () => {
  let component: SchemePaymentSuccessComponent;
  let fixture: ComponentFixture<SchemePaymentSuccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemePaymentSuccessComponent]
    });
    fixture = TestBed.createComponent(SchemePaymentSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
