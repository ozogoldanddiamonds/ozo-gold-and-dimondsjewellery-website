import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingService } from './service/loading.service';
import { CartService } from './service/cart.service';
import * as AOS from 'aos';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'OZO_Website';
  isAuthOpen = false;
  isLoading = false;
  cartCount: number = 0;

  selectedBottomTab: string = '';
  isLoggedIn = false;
  constructor(
    private router: Router,
    private loaderService: LoadingService,
    private toastr: ToastrService,
    private cartService: CartService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
  ngOnInit(): void {
    this.loaderService.loading$.subscribe((res) => {
      console.log('Loader status', res);
      this.isLoading = res;
    });
  }

  // aos animations  add
  ngAfterViewInit(): void {
    AOS.init({
      duration: 1000,
      once: false,
      offset: 100,
    });

    AOS.refresh();
  }

  customDesign() {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.toastr.warning('Please login first');

      this.openLoginModal();

      return;
    }
    this.router.navigate(['/custom-design']);
  }

  openLoginModal() {
    this.isAuthOpen = true;
  }
  closeAuthModal(isLoggedIn?: boolean) {
    this.isAuthOpen = false;
  }
}
