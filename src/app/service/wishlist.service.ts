import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private wishlistRefreshSubject = new BehaviorSubject<boolean>(false);
  wishlistRefresh$ = this.wishlistRefreshSubject.asObservable();
  private wishlistCountSubject =
    new BehaviorSubject<number>(0);

  wishlistCount$ =
    this.wishlistCountSubject.asObservable();
  constructor(private http: HttpClient) { }

  addToWishlist(payload: { user: string; product: string; variantId: string }) {
    return this.http.post(`${environment.apiUrl}/wishlist`, payload);
  }

  getWishlist(userId: string) {
    return this.http.get(`${environment.apiUrl}/wishlist/${userId}`);
  }

  removeWishlistItem(wishlistId: string, itemId: string) {
    return this.http.delete(`${environment.apiUrl}/wishlist/${wishlistId}/item/${itemId}`);
  }

  refreshWishlist() {
    this.wishlistRefreshSubject.next(true);
  }

  resetWishlistRefresh() {
    this.wishlistRefreshSubject.next(false);
  }
  updateWishlistCount(count: number) {

    this.wishlistCountSubject.next(count);

  }
}
