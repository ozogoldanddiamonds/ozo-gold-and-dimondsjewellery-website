import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartCheckoutSuccessComponent } from './cart-checkout-success.component';

describe('CartCheckoutSuccessComponent', () => {
  let component: CartCheckoutSuccessComponent;
  let fixture: ComponentFixture<CartCheckoutSuccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CartCheckoutSuccessComponent]
    });
    fixture = TestBed.createComponent(CartCheckoutSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
