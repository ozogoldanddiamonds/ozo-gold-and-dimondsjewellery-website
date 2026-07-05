import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CartService } from 'src/app/service/cart.service';
import { LoadingService } from 'src/app/service/loading.service';
import { WishlistService } from 'src/app/service/wishlist.service';

@Component({
  selector: 'app-whishlist',
  templateUrl: './whishlist.component.html',
  styleUrls: ['./whishlist.component.css']
})
export class WhishlistComponent implements OnInit {
  pendingAddToCart = false;
  pendingCartItem: any = null;
  isAuthOpen = false;
  constructor(private loaderService: LoadingService, private cartService: CartService,
    private toastr: ToastrService, private wishlistService: WishlistService) { }
  ngOnInit(): void {
    this.getWishlistItems();
  }
  wishlistItems: any[] = [];
  loading = false;
  wishlistId: any;



  moveToCart(item: any) {
    console.log('Move to cart:', item);
  }

  getWishlistItems() {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.wishlistItems = [];
      this.loaderService.hide();
      return;
    }

    this.loading = true;
    this.loaderService.show();
    this.wishlistService.getWishlist(userId).subscribe({
      next: (res: any) => {
        console.log(res, 'wishlist');
        this.loading = false;
        this.wishlistId = res?.wishlistId ? String(res.wishlistId) : '';
        this.loaderService.hide();
        this.wishlistItems = (res?.items || []).map((item: any) => ({
          wishlistItemId: item.wishlistItemId,
          productId: item.productId,
          variantId: item.variantId,
          name: item.productName,
          brand: 'OZO Jewellery',
          image: item.image,

          variants: item.variants || [],

          inStock: (item?.selectedVariant?.stock || 0) > 0,

          price: item?.selectedVariant?.finalPrice || 0,

          oldPrice: item?.selectedVariant?.priceBreakup?.metalValue || 0,

          discount: item?.selectedVariant?.discountPercentage || 0,

          selectedVariant: item?.selectedVariant
        }));
        console.log(this.wishlistItems, 'wishlist items');
      },
      error: (err) => {
        this.loading = false;
        this.loaderService.hide();
        console.log(err);

        if (err?.status === 404) {
          this.wishlistId = '';
          this.wishlistItems = [];
        }
      }
    });
  }

  removeFromWishlist(item: any) {
    if (!this.wishlistId || !item?.wishlistItemId) return;
    this.loading = true;
    this.wishlistService.removeWishlistItem(this.wishlistId, item.wishlistItemId).subscribe({
      next: async () => {
        this.wishlistItems = this.wishlistItems.filter(
          x => x.wishlistItemId !== item.wishlistItemId
        );

        this.wishlistService.refreshWishlist();
        this.loading = false;
        this.toastr.success(
          'Removed from wishlist'
        );
      },
      error: async (err) => {
        console.log(err);
        this.toastr.warning(
          'Please login first'
        );
      }
    });
  }

  addToCart(item: any) {

    const userId =
      localStorage.getItem('userId');

    if (!userId) {

      this.toastr.warning(
        'Please login first'
      );

      this.pendingAddToCart = true;

      this.openLoginModal();

      return;
    }

    if (
      !item?.productId ||
      !item?.selectedVariant?._id
    ) {

      this.toastr.warning(
        'Product variant not found'
      );

      return;
    }

    const payload = {

      user: userId,

      product: item.productId,

      variantId:
        item.selectedVariant._id,

      quantity: 1

    };

    this.cartService
      .addToCart(payload)
      .subscribe({

        next: (res: any) => {

          this.cartService.loadCartCount();

          this.toastr.success(

            res?.message ||
            'Added to cart successfully'

          );

        },

        error: (err: any) => {

          this.toastr.error(

            err?.error?.message ||
            'Failed to add cart'

          );

        }

      });

  }

  openLoginModal() {

    this.isAuthOpen = true;

  }
  closeAuthModal(isLoggedIn?: boolean) {

    this.isAuthOpen = false;

    if (
      isLoggedIn &&
      this.pendingAddToCart &&
      this.pendingCartItem
    ) {

      this.pendingAddToCart = false;

      this.addToCart(
        this.pendingCartItem
      );

      this.pendingCartItem = null;

    }

  }
}
