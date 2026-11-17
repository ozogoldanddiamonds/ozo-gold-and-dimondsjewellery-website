import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-checkout-payment-faile',
  templateUrl: './cart-checkout-payment-faile.component.html',
  styleUrls: ['./cart-checkout-payment-faile.component.css']
})
export class CartCheckoutPaymentFaileComponent implements OnInit {

  payment: any = {};

  message = 'Payment could not be completed.';

  constructor(private router: Router) { }

  ngOnInit(): void {
    const state = history.state;

    if (state?.paymentState !== 'failure') {
      this.router.navigate(['/']);
      return;
    }

    this.payment = state;

    this.message =
      state?.message ||
      'Payment could not be completed.';
  }

  goHome(): void {
    this.router.navigate(['/'], {
      replaceUrl: true
    });
  }

  retryPayment(): void {
    this.router.navigate(['/cart'], {
      replaceUrl: true
    });
  }


}
