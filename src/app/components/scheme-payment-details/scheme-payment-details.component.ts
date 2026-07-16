import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from 'src/app/service/loading.service';
import { UserSchemesService } from 'src/app/service/user-schemes.service';

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

  constructor(

    private route: ActivatedRoute,

    private schemeService: UserSchemesService,

    private loader: LoadingService,

    private toastr: ToastrService

  ) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      this.subscriptionId = params.get('id') || '';

      this.getUserSchemeDetails();
      this.getUserPayments();   // instead of getPaymentHistory()

    });

  }


  getUserSchemeDetails() {

    const userId =

      localStorage.getItem('userId');

    if (!userId) return;

    this.loader.show();

    this.schemeService

      .getUserSchemeById(

        userId,

        this.subscriptionId

      )

      .subscribe({

        next: (res: any) => {

          this.loader.hide();

          this.scheme = res.data;
          this.getUserPayments();
        },

        error: (err: any) => {

          this.loader.hide();

          console.log(err);

        }

      });

  }
  getPaymentHistory() {

    this.schemeService

      .getPaymentHistory(

        this.subscriptionId

      )

      .subscribe({

        next: (res: any) => {

          this.payments =

            res.data || [];

        },

        error: (err: any) => {

          console.log(err);

        }

      });

  }
  //===================================
  // PROGRESS
  //===================================

  calculateProgress() {

    if (

      this.scheme?.totalInstallments > 0

    ) {

      this.progress =

        (

          this.scheme.paidInstallments

          /

          this.scheme.totalInstallments

        ) * 100;

    }

  }

  //===================================
  // PAY NOW
  //===================================

  payNow() {

    const userId = localStorage.getItem('userId');

    if (!userId) {

      this.toastr.warning('Please login');

      return;

    }

    const payload = {

      subscription: this.scheme._id,

      user: userId,

      paymentMode: "UPI",

      gateway: "PHONEPE",

      transactionId:
        "PP" + Date.now()

    };

    this.loader.show();

    this.schemeService
      .createPayment(payload)
      .subscribe({

        next: (res: any) => {

          this.loader.hide();

          this.toastr.success(

            res.message ||

            "Installment Paid Successfully"

          );

          // Refresh Scheme Summary

          this.getUserSchemeDetails();

          // Refresh Payment History

          this.getPaymentHistory();

        },

        error: (err: any) => {

          this.loader.hide();

          this.toastr.error(

            err?.error?.message ||

            "Payment Failed"

          );

        }

      });

  }
  getUserPayments() {

    const userId =

      localStorage.getItem('userId');

    if (!userId) return;

    this.schemeService
      .getUserPayments(userId)
      .subscribe({

        next: (res: any) => {

          // Show only current scheme payments

          this.payments =

            (res.data || []).filter(

              (x: any) =>

                x.subscription?._id === this.subscriptionId

            );

        },

        error: (err: any) => {

          console.log(err);

        }

      });

  }
}
