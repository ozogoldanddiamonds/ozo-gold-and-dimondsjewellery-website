import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from 'src/app/service/loading.service';
import { UserSchemesService } from 'src/app/service/user-schemes.service';
import { firstValueFrom } from 'rxjs';
declare global {
  interface Window {
    Razorpay: any;
  }
}
@Component({
  selector: 'app-scheme-payment-details',
  templateUrl: './scheme-payment-details.component.html',
  styleUrls: ['./scheme-payment-details.component.css']
})
export class SchemePaymentDetailsComponent implements OnInit {

  subscriptionId = '';
  scheme: any = {};
  payments: any[] = [];

  loading = false;
  progress = 0;
  isPaying = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private schemeService: UserSchemesService,
    private loader: LoadingService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.subscriptionId = params.get('id') || '';

      if (this.subscriptionId) {
        this.getUserSchemeDetails();
      }
    });
  }

  // ==============================
  // GET SCHEME DETAILS
  // ==============================

  getUserSchemeDetails(): void {

    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.toastr.warning('Please login');
      return;
    }

    this.loader.show();

    this.schemeService
      .getUserSchemeById(userId, this.subscriptionId)
      .subscribe({

        next: (res: any) => {
          this.loader.hide();

          this.scheme = res.data || {};

          this.calculateProgress();
          this.getUserPayments();
        },

        error: (err: any) => {
          this.loader.hide();

          console.error(err);

          this.toastr.error(
            err?.error?.message || 'Unable to load scheme details'
          );
        }

      });
  }

  // ==============================
  // GET PAYMENT HISTORY
  // ==============================

  getUserPayments(): void {

    const userId = localStorage.getItem('userId');

    if (!userId) return;

    this.schemeService
      .getUserPayments(userId)
      .subscribe({

        next: (res: any) => {

          this.payments = (res.data || []).filter(
            (payment: any) =>
              payment.subscription?._id === this.subscriptionId ||
              payment.subscription === this.subscriptionId
          );

        },

        error: (err: any) => {
          console.error(err);
        }

      });
  }

  // ==============================
  // PROGRESS
  // ==============================

  calculateProgress(): void {

    if (this.scheme?.totalInstallments > 0) {

      this.progress =
        (this.scheme.paidInstallments /
          this.scheme.totalInstallments) * 100;

    } else {
      this.progress = 0;
    }
  }

  private loadRazorpayScript(): Promise<void> {

    return new Promise((resolve, reject) => {

      // Already loaded
      if (window.Razorpay) {
        resolve();
        return;
      }

      const scriptUrl =
        'https://checkout.razorpay.com/v1/checkout.js';

      const existingScript = document.querySelector(
        `script[src="${scriptUrl}"]`
      ) as HTMLScriptElement | null;

      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');

      script.src = scriptUrl;
      script.async = true;

      script.onload = () => {

        if (window.Razorpay) {
          console.log('Razorpay script loaded successfully');
          resolve();
        } else {
          reject(new Error('Razorpay SDK not initialized'));
        }

      };

      script.onerror = () => {
        reject(new Error('Razorpay script loading failed'));
      };

      document.head.appendChild(script);

    });
  }


  // ==============================
  // PAY INSTALLMENT
  // ==============================

  async payNow(): Promise<void> {

    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.toastr.warning('Please login first');
      return;
    }

    if (!this.scheme?._id || !this.subscriptionId) {
      this.toastr.error('Scheme details not found');
      return;
    }

    if (this.scheme.status !== 'ACTIVE') {
      this.toastr.warning('This scheme is not active');
      return;
    }

    if (this.scheme.remainingInstallments <= 0) {
      this.toastr.warning('All installments are already paid');
      return;
    }

    if (this.isPaying) {
      return;
    }

    this.isPaying = true;
    this.loader.show();

    try {

      // STEP 1: LOAD RAZORPAY SCRIPT

      await this.loadRazorpayScript();

      // STEP 2: CREATE RAZORPAY ORDER

      const response: any = await firstValueFrom(
        this.schemeService.createSchemeRazorpayOrder({
          subscriptionId: this.subscriptionId
        })
      );

      if (!response?.success || !response?.data) {
        throw new Error(
          response?.message || 'Unable to create payment order'
        );
      }

      const payment = response.data;

      console.log('Scheme Razorpay Order:', payment);

      // STEP 3: VALIDATE ORDER RESPONSE

      if (
        !payment.keyId ||
        !payment.razorpayOrderId ||
        !payment.paymentAttemptId ||
        !payment.amount
      ) {
        throw new Error('Invalid Razorpay order details received');
      }

      // STEP 4: RAZORPAY OPTIONS

      const options = {

        key: payment.keyId,

        amount: String(payment.amount),

        currency: payment.currency || 'INR',

        name: 'OZO Gold & Diamonds',

        description: `Scheme Installment - Month ${payment.monthNo}`,

        order_id: payment.razorpayOrderId,

        prefill: {
          name: this.scheme.user?.name || '',
          email: this.scheme.user?.email || '',
          contact: this.scheme.user?.phone || ''
        },

        notes: {
          subscriptionId: this.subscriptionId,
          paymentAttemptId: payment.paymentAttemptId,
          monthNo: payment.monthNo
        },

        theme: {
          color: '#B8860B'
        },

        modal: {
          ondismiss: () => {

            this.isPaying = false;

            console.log('Razorpay checkout closed');

          }
        },

        handler: (result: any) => {

          void this.verifyPayment(result, payment);

        }

      };

      // STEP 5: OPEN RAZORPAY

      const checkout = new window.Razorpay(options);

      checkout.on('payment.failed', (result: any) => {

        console.error('Razorpay payment failed:', result?.error);

        this.isPaying = false;

        this.toastr.error(
          result?.error?.description || 'Payment could not be completed'
        );

      });

      this.loader.hide();

      checkout.open();

    } catch (error: any) {

      console.error('Scheme checkout initialization failed:', error);

      this.toastr.error(
        error?.error?.message ||
        error?.message ||
        'Unable to start payment'
      );

      this.isPaying = false;
      this.loader.hide();

    }
  }

  // private async verifyPayment(
  //   result: any,
  //   payment: any
  // ): Promise<void> {

  //   const {
  //     razorpay_order_id,
  //     razorpay_payment_id,
  //     razorpay_signature
  //   } = result || {};

  //   if (
  //     !razorpay_order_id ||
  //     !razorpay_payment_id ||
  //     !razorpay_signature
  //   ) {

  //     this.isPaying = false;

  //     this.toastr.warning(
  //       'Payment response is incomplete. Please check payment status.'
  //     );

  //     return;
  //   }

  //   this.loader.show();

  //   try {

  //     const verification: any = await firstValueFrom(
  //       this.schemeService.verifySchemeRazorpayPayment({

  //         paymentAttemptId: payment.paymentAttemptId,

  //         razorpay_order_id,

  //         razorpay_payment_id,

  //         razorpay_signature

  //       })
  //     );

  //     console.log('Scheme Payment Verification:', verification);

  //     const data = verification?.data;

  //     if (
  //       verification?.success &&
  //       data?.status === 'INSTALLMENT_PAID'
  //     ) {

  //       // PAYMENT SUCCESS
  //       console.log('Subscription ID before navigation:', this.subscriptionId);
  //       this.router.navigate(['/scheme-payment-success'], {

  //         replaceUrl: true,

  //         state: {

  //           paymentState: 'success',

  //           status: data.status,

  //           paymentAttemptId: payment.paymentAttemptId,

  //           paymentId: razorpay_payment_id,

  //           amount: Number(payment.amount) / 100,

  //           monthNo: payment.monthNo,

  //           schemeName: this.scheme.schemeName || 'Gold Scheme',

  //           subscriptionId: this.subscriptionId

  //         }

  //       });

  //       return;
  //     }

  //     // Payment verification is not confirmed.
  //     // Do not redirect to failure page.

  //     this.toastr.warning(
  //       'Payment is being verified. Please check your payment history.'
  //     );

  //     this.getUserSchemeDetails();

  //   } catch (error: any) {

  //     console.error('Scheme payment verification failed:', error);

  //     // Verification API failure does not mean payment failed.

  //     this.toastr.warning(
  //       'Payment status is being confirmed. Please do not pay again immediately.'
  //     );

  //     this.getUserSchemeDetails();

  //   } finally {

  //     this.loader.hide();
  //     this.isPaying = false;

  //   }
  // }
  private async verifyPayment(
    result: any,
    payment: any
  ): Promise<void> {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = result || {};

    // Validate Razorpay response
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      this.isPaying = false;

      this.toastr.warning(
        'Payment response is incomplete. Please check your payment status.'
      );

      return;
    }

    this.loader.show();

    try {

      const verification: any = await firstValueFrom(
        this.schemeService.verifySchemeRazorpayPayment({

          paymentAttemptId: payment.paymentAttemptId,

          razorpay_order_id: razorpay_order_id,

          razorpay_payment_id: razorpay_payment_id,

          razorpay_signature: razorpay_signature

        })
      );

      console.log(
        'Scheme Payment Verification:',
        verification
      );

      const data = verification?.data;

      // ==============================
      // PAYMENT SUCCESS
      // ==============================

      if (
        verification?.success === true &&
        data?.status === 'INSTALLMENT_PAID'
      ) {

        this.router.navigate(
          ['/scheme-payment-success'],
          {
            replaceUrl: true,

            state: {

              paymentState: 'success',

              status: data.status,

              paymentAttemptId: payment.paymentAttemptId,

              paymentId: razorpay_payment_id,

              amount: Number(payment.amount) / 100,

              monthNo: payment.monthNo,

              schemeName:
                this.scheme?.schemeName || 'Gold Scheme',

              subscriptionId: this.subscriptionId

            }
          }
        );

        return;
      }

      // ==============================
      // VERIFICATION PENDING
      // ==============================

      this.toastr.warning(
        'Payment verification is pending. Please do not pay again.'
      );

      this.getUserSchemeDetails();
      this.getUserPayments();

    } catch (error: any) {

      console.error(
        'Scheme Payment Verification Error:',
        error
      );

      // Verification API error does not mean payment failed.
      this.toastr.warning(
        'Payment verification is pending. Please check your payment history before retrying.'
      );

      this.getUserSchemeDetails();
      this.getUserPayments();

    } finally {

      this.loader.hide();

      this.isPaying = false;

    }
  }
}
