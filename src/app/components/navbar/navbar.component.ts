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
  constructor(public router: Router, private toastr: ToastrService,
    private authService: AuthService, private wishlistService: WishlistService,
    private cartService: CartService, private productService: ProductService) { }
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
  cartCount: number = 0;
  isLoading = false;
  isLoggedIn = false;

  toggleCategoryMenu() {
    this.isCategoryOpen = !this.isCategoryOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    const topHeader = document.getElementById('topHeader');
    const navbar = document.getElementById('mainNavbar');

    if (scrollTop > this.lastScrollTop) {
      // 🔽 Scroll down
      topHeader?.classList.add('hide');
    } else {
      // 🔼 Scroll up
      topHeader?.classList.remove('hide');
    }

    // Add shadow effect
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

      // 🔥 IMPORTANT FIX
      this.isMenuOpen = false;

    }, 200);
  }


  ngOnInit(): void {
    this.getProducts();
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.userId = userData?._id;
    }
    this.loadCartCount();
    this.cartService.cartCount$
      .subscribe(count => {

        this.cartCount = count;
        console.log(count, 'cart count');

      });
    this.authService.loginStatus$
      .subscribe(status => {

        this.isLoggedIn = status;

      });
    this.checkLoginStatus();
    this.loadWishlistCount();
    this.wishlistService
      .wishlistCount$
      .subscribe(count => {

        this.wishlistCount = count;

      });
  }
  checkLoginStatus() {
    const userId = localStorage.getItem('userId');
    this.isLoggedIn = !!userId;
  }
  loadWishlistCount() {

    const userId =
      localStorage.getItem('userId');

    if (!userId) {

      this.wishlistCount = 0;

      return;

    }

    this.wishlistService
      .getWishlist(userId)
      .subscribe({

        next: (res: any) => {

          this.wishlistService
            .updateWishlistCount(

              res?.items?.length || 0

            );

        }

      });

  }
  loadCartCount() {

    const userId =
      localStorage.getItem('userId');

    if (!userId) {

      this.cartCount = 0;

      return;
    }

    this.cartService
      .getCart(userId)
      .subscribe({

        next: (res: any) => {

          this.cartCount =
            res.cartCount;

          // 🔥 update subject also
          this.cartService.updateCartCount(
            res.cartCount
          );

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
    this.router.navigate(["/whishlist"]);
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

    this.toastr.success(
      'Logout Success'
    );

    this.router.navigate(['/']);

  }
  getProducts() {

    this.productService
      .getProducAllProducts()
      .subscribe({

        next: (res: any) => {

          const products =
            res?.data || [];

          this.categories = [

            ...new Map(

              products.map(
                (item: any) => [

                  item.category?._id,

                  item.category

                ]
              )

            ).values()

          ];

        }

      });

  }

}
