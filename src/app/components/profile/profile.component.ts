import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { CartService } from 'src/app/service/cart.service';
import { WishlistService } from 'src/app/service/wishlist.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileData: any;
  cartCount = 0;
  wishlistCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.getProfileSummary();

    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    this.wishlistService.wishlistCount$.subscribe(count => {
      this.wishlistCount = count;
    });
  }

  getProfileSummary(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      return;
    }

    this.authService.getProfileSummary(userId).subscribe({
      next: (res: any) => {
        this.profileData = res?.data;
      },
      error: (err: any) => {
        console.error('Profile summary error:', err);
      }
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'U';

    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[1].charAt(0)
    ).toUpperCase();
  }

  goBack(): void {
    window.history.back();
  }

  wishlist(): void {
    this.router.navigate(['/whishlist']);
  }

  cart(): void {
    this.router.navigate(['/cart']);
  }

  orders(): void {
    this.router.navigate(['/orders']);
  }

  openContactModal(): void {
    this.router.navigate(['/contact']);
  }

  openAddressPage(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      alert('Please login first');
      this.openLoginModal();
      return;
    }

    this.router.navigate(['/address']);
  }

  openLoginModal(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    const confirmed = window.confirm('Are you sure you want to logout?');

    if (!confirmed) {
      return;
    }

    this.doLogout();
  }

  doLogout(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      return;
    }

    this.authService.logout(userId).subscribe({
      next: () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');

        this.cartService.updateCartCount(0);
        this.wishlistService.updateWishlistCount(0);

        this.router.navigateByUrl('/home');
      },
      error: (err: any) => {
        console.error('Logout error:', err);
      }
    });
  }
}
