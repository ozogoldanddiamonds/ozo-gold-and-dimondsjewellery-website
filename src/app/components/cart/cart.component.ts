import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/service/cart.service';
import { LoadingService } from 'src/app/service/loading.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  cartId: string = '';
  cartCount: number = 0;
  private refreshSub!: Subscription;
  constructor(private cartService: CartService, private toaster: ToastrService,
    private router: Router, private loaderService: LoadingService) { }

  ngOnInit(): void {
    this.getCartItems();
    this.refreshSub = this.cartService.cartRefresh$.subscribe((refresh) => {
      if (refresh) {
        this.getCartItems();
        this.cartService.resetCartRefresh();
      }
    });
  }

  increase(item: any) {

    const quantity =
      item.quantity + 1;

    this.updateQuantity(
      item,
      quantity
    );

  }
  decrease(item: any) {

    if (item.quantity <= 1) {

      this.toaster.warning(
        'Minimum quantity is 1'
      );

      return;

    }

    const quantity =
      item.quantity - 1;

    this.updateQuantity(
      item,
      quantity
    );

  }
  updateQuantity(
    item: any,
    quantity: number
  ) {

    this.loaderService.show();

    this.cartService
      .updateCartQuantity(

        this.cartId,

        item.cartItemId,

        quantity

      )
      .subscribe({

        next: (res: any) => {

          item.quantity = quantity;

          item.totalPrice =

            item.selectedVariant.finalPrice *

            quantity;

          this.toaster.success(
            'Cart quantity updated successfully'
          );

          this.loaderService.hide();

        },

        error: (err) => {

          this.loaderService.hide();

          this.toaster.error(

            err?.error?.message ||

            'Failed to update quantity'

          );

        }

      });

  }
  remove(item: any) {

    this.loaderService.show();

    this.cartService
      .removeCartItem(

        this.cartId,

        item.cartItemId

      )
      .subscribe({

        next: (res: any) => {

          this.cartItems =

            this.cartItems.filter(

              x =>

                x.cartItemId !==

                item.cartItemId

            );

          this.cartCount =
            this.cartItems.length;

          this.cartService
            .updateCartCount(
              this.cartCount
            );

          this.cartService
            .refreshCart();

          this.toaster.success(
            'Item removed from cart'
          );

          this.loaderService.hide();

        },

        error: (err) => {

          this.loaderService.hide();

          this.toaster.error(

            err?.error?.message ||

            'Failed to remove item'

          );

        }

      });

  }

  getCartItems() {

    const userId =
      localStorage.getItem('userId');

    if (!userId) {

      this.cartItems = [];

      this.loaderService.hide();

      return;

    }

    this.loaderService.show();

    this.cartService
      .getCart(userId)
      .subscribe({

        next: (res: any) => {

          this.cartItems =
            res?.items || [];

          this.cartCount =
            res?.cartCount ||
            this.cartItems.length;

          this.cartId =
            res?.cartId || '';

          this.cartService
            .updateCartCount(
              this.cartCount
            );

          this.loaderService.hide();

        },

        error: (err) => {

          this.loaderService.hide();

          this.toaster.error(

            err?.error?.message ||

            'Failed to load cart'

          );

        }

      });

  }
  getSubtotal() {

    return this.cartItems.reduce(

      (total, item) =>

        total + item.totalPrice,

      0

    );

  }

}
