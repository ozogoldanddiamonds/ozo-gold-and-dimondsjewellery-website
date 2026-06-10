import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  private cartRefreshSubject = new BehaviorSubject<boolean>(false);
  cartRefresh$ = this.cartRefreshSubject.asObservable();

  constructor(private http: HttpClient) { }

  addToCart(data: any) {
    return this.http.post(`${environment.apiUrl}/addcart`, data);
  }

  updateCartCount(count: number) {
    this.cartCountSubject.next(count);
  }

  refreshCart() {
    this.cartRefreshSubject.next(true);
  }

  resetCartRefresh() {
    this.cartRefreshSubject.next(false);
  }

  getCart(userId: string) {
    return this.http.get(`${environment.apiUrl}/getCart/${userId}`);
  }

  updateCartQuantity(cartId: string, itemId: string, quantity: number) {
    return this.http.put(
      `${environment.apiUrl}/updateCartQuantity/${cartId}/item/${itemId}`,
      { quantity }
    );
  }

  removeCartItem(cartId: string, itemId: string) {
    return this.http.delete(
      `${environment.apiUrl}/removeCart/${cartId}/item/${itemId}`
    );
  }
  loadCartCount() {

    const userId =
      localStorage.getItem('userId');

    if (!userId) {

      this.updateCartCount(0);

      return;

    }

    this.getCart(userId)
      .subscribe({

        next: (res: any) => {

          this.updateCartCount(

            res?.cartCount || 0

          );

        },

        error: () => {

          this.updateCartCount(0);

        }

      });

  }

}
