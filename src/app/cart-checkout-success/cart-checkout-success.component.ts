import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-checkout-success',
  templateUrl: './cart-checkout-success.component.html',
  styleUrls: ['./cart-checkout-success.component.css']
})
export class CartCheckoutSuccessComponent implements OnInit {

  payment: any = {};

  constructor(private router: Router) { }

  ngOnInit(): void {
    const state = history.state;

    // Never show success without a confirmed order.
    if (
      state?.paymentState !== 'success' ||
      state?.status !== 'ORDER_CREATED' ||
      !state?.orderId
    ) {
      this.router.navigate(['/']);
      return;
    }

    this.payment = state;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

}
