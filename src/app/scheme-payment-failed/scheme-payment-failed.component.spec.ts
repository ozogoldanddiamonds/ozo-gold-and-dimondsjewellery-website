import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemePaymentFailedComponent } from './scheme-payment-failed.component';

describe('SchemePaymentFailedComponent', () => {
  let component: SchemePaymentFailedComponent;
  let fixture: ComponentFixture<SchemePaymentFailedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemePaymentFailedComponent]
    });
    fixture = TestBed.createComponent(SchemePaymentFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
