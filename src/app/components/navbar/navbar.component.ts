import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/service/auth.service';
import { CartService } from 'src/app/service/cart.service';
import { ProductService } from 'src/app/service/product.service';
import { WishlistService } from 'src/app/service/wishlist.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  constructor(
    public router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private wishlistService: WishlistService,
    private cartService: CartService,
    private productService: ProductService
  ) { }
  profileData: any;
  categories: any[] = [];
  products: any[] = [];
  userId: string | null = null;
  wishlistCount = 0;
  isAuthOpen = false;
  activeAuthTab: 'login' | 'register' = 'login';
  showLoginPassword = false;
  showRegisterPassword = false;
  isCategoryOpen = false;
  isMenuOpen = false;
  lastScrollTop = 0;
  cartCount = 0;
  isLoading = false;
  isLoggedIn = false;
  userName: string = '';

  ngOnInit(): void {
    this.getProducts();
    this.getProfileSummary();

    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.userId = userData?._id;
      this.userName = userData?.name || userData?.fullName || userData?.username || '';
    }

    this.loadCartCount();

    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    this.authService.loginStatus$.subscribe(status => {
      this.isLoggedIn = status;
    });

    this.checkLoginStatus();
    this.loadWishlistCount();

    this.wishlistService.wishlistCount$.subscribe(count => {
      this.wishlistCount = count;
    });

  }

  isMobileView(): boolean {
    return window.innerWidth < 992;
  }
  getProfileSummary(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      return;
    }

    this.authService.getProfileSummary(userId).subscribe({
      next: (res: any) => {
        this.profileData = res?.data;
        console.log(this.profileData, 'user data');
      },
      error: (err: any) => {
        console.error('Profile summary error:', err);
      }
    });
  }

  toggleCategoryMenu(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.isMobileView()) {
      this.isCategoryOpen = !this.isCategoryOpen;
    }
  }

  openCategoryMenuDesktop() {
    if (!this.isMobileView()) {
      this.isCategoryOpen = true;
    }
  }

  closeCategoryMenuDesktop() {
    if (!this.isMobileView()) {
      this.isCategoryOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {

    const target =
      event.target as HTMLElement;

    const dropdown =
      target.closest('.mega-dropdown');

    if (
      this.isMobileView() &&
      !dropdown
    ) {
      this.isCategoryOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.isMobileView()) {
      const navbar = document.getElementById('navbarNav');
      navbar?.classList.remove('show');
      this.isMenuOpen = false;
    }
    this.isCategoryOpen = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    const topHeader = document.getElementById('topHeader');
    const navbar = document.getElementById('mainNavbar');

    if (scrollTop > this.lastScrollTop) {
      topHeader?.classList.add('hide');
    } else {
      topHeader?.classList.remove('hide');
    }

    if (scrollTop > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }

  closeMenu() {
    setTimeout(() => {
      const navbar = document.getElementById('navbarNav');
      navbar?.classList.remove('show');
      this.isMenuOpen = false;
      this.isCategoryOpen = false;
    }, 200);
  }

  checkLoginStatus() {
    const userId = localStorage.getItem('userId');
    this.isLoggedIn = !!userId;
  }

  loadWishlistCount() {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.wishlistCount = 0;
      return;
    }

    this.wishlistService.getWishlist(userId).subscribe({
      next: (res: any) => {
        this.wishlistService.updateWishlistCount(res?.items?.length || 0);
      }
    });
  }

  loadCartCount() {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.cartCount = 0;
      return;
    }

    this.cartService.getCart(userId).subscribe({
      next: (res: any) => {
        this.cartCount = res.cartCount;
        this.cartService.updateCartCount(res.cartCount);
      },
      error: () => {
        this.cartCount = 0;
      }
    });
  }

  openAuthModal() {
    this.isAuthOpen = true;
  }

  closeAuthModal(isLoggedIn?: boolean) {
    this.isAuthOpen = false;

    if (isLoggedIn) {
      this.checkLoginStatus();
      this.loadWishlistCount();
      this.loadCartCount();
    }
  }

  toggleLoginPassword() {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPassword() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  whishlist() {
    this.router.navigate(['/whishlist']);
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    this.userId = null;
    this.authService.updateLoginStatus(false);
    this.isLoggedIn = false;
    this.cartCount = 0;
    this.cartService.updateCartCount(0);

    this.toastr.success('Logout Success');
    this.router.navigate(['/']);
  }

  getProducts() {
    this.productService.getProducAllProducts().subscribe({
      next: (res: any) => {
        const products = res?.data || [];
        this.categories = [
          ...new Map(
            products.map((item: any) => [item.category?._id, item.category])
          ).values()
        ];
      }
    });
  }


}
