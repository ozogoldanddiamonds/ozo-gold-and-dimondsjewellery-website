import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from 'src/app/service/loading.service';
import { UserScheme, UserSchemesService } from 'src/app/service/user-schemes.service';

@Component({
  selector: 'app-user-schemes-page',
  templateUrl: './user-schemes-page.component.html',
  styleUrls: ['./user-schemes-page.component.css']
})
export class UserSchemesPageComponent implements OnInit {
  schemes: any[] = [];
  userSchemes: any[] = [];
  filteredSchemes: any[] = [];
  joinedSchemes: string[] = [];
  loading = false;
  isAuthOpen = false;
  search = '';

  constructor(
    private schemeService: UserSchemesService,
    private loader: LoadingService,
    private toastr: ToastrService, private router: Router
  ) { }

  ngOnInit(): void {

    this.getAllSchemes();

    this.getUserSchemes();
  }

  getAllSchemes() {

    this.loading = true;

    this.loader.show();

    this.schemeService
      .getAllSchemes()
      .subscribe({

        next: (res: any) => {

          this.loading = false;

          this.loader.hide();

          this.schemes =
            res?.data || [];

          this.filteredSchemes =
            [...this.schemes];

        },

        error: (err) => {

          console.log(err);

          this.loading = false;

          this.loader.hide();

          this.toastr.error(
            err?.error?.message ||
            'Failed to load schemes'
          );

        }

      });

  }
  getUserSchemes() {

    const userId =
      localStorage.getItem('userId');

    if (!userId) return;

    this.schemeService
      .getUserSchemeByUserId(userId)
      .subscribe({

        next: (res: any) => {

          this.userSchemes = res.data || [];

          this.joinedSchemes =

            this.userSchemes.map(

              (x: any) => x.scheme._id

            );

        },

        error: (err) => {

          console.log(err);

        }

      });

  }
  getUserSchemeId(schemeId: string): string {

    const scheme = this.userSchemes.find(

      (x: any) => x.scheme._id === schemeId

    );

    return scheme ? scheme._id : '';

  }
  searchScheme() {

    const value =
      this.search
        .trim()
        .toLowerCase();

    if (!value) {

      this.filteredSchemes =
        [...this.schemes];

      return;

    }

    this.filteredSchemes =

      this.schemes.filter((item: any) =>

        item.name
          ?.toLowerCase()
          .includes(value)

        ||

        item.description
          ?.toLowerCase()
          .includes(value)

      );

  }

  joinScheme(item: any) {

    const userId =
      localStorage.getItem('userId');

    if (!userId) {

      this.toastr.warning(
        'Please login first'
      );

      this.openLoginModal();

      return;
    }
    const payload = {

      user: userId,

      scheme: item._id

    };

    this.loader.show();

    this.schemeService
      .createUserScheme(payload)
      .subscribe({

        next: (res: any) => {

          this.loader.hide();
          this.toastr.success(

            res?.message ||

            'Scheme subscribed successfully'

          );
          // Refresh joined schemes
          this.getUserSchemes();

          // Refresh scheme list
          this.getAllSchemes();
          console.log(res);

          // Optional
          // this.router.navigate(['/my-schemes']);

        },

        error: (err: any) => {

          this.loader.hide();

          this.toastr.error(

            err?.error?.message ||

            'Failed to subscribe scheme'

          );

        }

      });

  }

  viewDetails(item: any) {

    console.log(item);


  }


  openLoginModal() {

    this.isAuthOpen = true;

  }
  closeAuthModal(isLoggedIn?: boolean) {

    this.isAuthOpen = false;

  }

  payInstallment(item: any) {

    const userSchemeId =

      this.getUserSchemeId(item._id);

    if (!userSchemeId) {

      this.toastr.error(
        'Subscribed scheme not found'
      );

      return;

    }

    this.router.navigate([
      '/scheme-payment',
      userSchemeId
    ]);

  }
}
