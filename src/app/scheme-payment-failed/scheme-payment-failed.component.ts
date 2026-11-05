import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-scheme-payment-failed',
  templateUrl: './scheme-payment-failed.component.html',
  styleUrls: ['./scheme-payment-failed.component.css']
})
export class SchemePaymentFailedComponent implements OnInit {

  message = 'Your payment could not be completed.';

  subscriptionId = '';

  paymentAttemptId = '';

  reason = '';

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    const state = history.state || {};

    this.message =
      state.message || 'Your payment could not be completed.';

    this.subscriptionId =
      state.subscriptionId || '';

    this.paymentAttemptId =
      state.paymentAttemptId || '';

    this.reason = state.reason || '';

    console.log('Failure Page State:', state);

  }

  goToSchemes(): void {

    if (!this.subscriptionId) {
      this.toastr.error('Subscribed scheme not found');
      return;
    }

    this.router.navigate([
      '/scheme-payment',
      this.subscriptionId
    ]);

  }

  retryPayment(): void {

    if (!this.subscriptionId) {
      this.toastr.error('Subscribed scheme not found');
      return;
    }

    this.router.navigate([
      '/scheme-payment',
      this.subscriptionId
    ]);

  }

}
