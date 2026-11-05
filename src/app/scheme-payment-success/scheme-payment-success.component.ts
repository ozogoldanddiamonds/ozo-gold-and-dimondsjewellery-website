import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-scheme-payment-success',
  templateUrl: './scheme-payment-success.component.html',
  styleUrls: ['./scheme-payment-success.component.css']
})
export class SchemePaymentSuccessComponent implements OnInit {

  amount = 0;
  monthNo = 0;
  paymentId = '';
  schemeName = 'Gold Scheme';
  subscriptionId = '';

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    const navigationState =
      this.router.getCurrentNavigation()?.extras?.state || {};

    const state = {
      ...navigationState,
      ...history.state
    };

    console.log('Success Page State:', state);

    this.amount = Number(state['amount'] || 0);
    this.monthNo = Number(state['monthNo'] || 0);
    this.paymentId = state['paymentId'] || '';
    this.schemeName = state['schemeName'] || 'Gold Scheme';

    this.subscriptionId =
      state['subscriptionId'] || '';

    console.log('Received Subscription ID:', this.subscriptionId);

  }

  goToSchemes(): void {

    console.log('Navigating with Subscription ID:', this.subscriptionId);

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
