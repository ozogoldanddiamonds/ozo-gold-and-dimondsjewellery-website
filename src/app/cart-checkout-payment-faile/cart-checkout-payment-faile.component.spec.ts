import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartCheckoutPaymentFaileComponent } from './cart-checkout-payment-faile.component';

describe('CartCheckoutPaymentFaileComponent', () => {
  let component: CartCheckoutPaymentFaileComponent;
  let fixture: ComponentFixture<CartCheckoutPaymentFaileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CartCheckoutPaymentFaileComponent]
    });
    fixture = TestBed.createComponent(CartCheckoutPaymentFaileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
