import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemePaymentDetailsComponent } from './scheme-payment-details.component';

describe('SchemePaymentDetailsComponent', () => {
  let component: SchemePaymentDetailsComponent;
  let fixture: ComponentFixture<SchemePaymentDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemePaymentDetailsComponent]
    });
    fixture = TestBed.createComponent(SchemePaymentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
