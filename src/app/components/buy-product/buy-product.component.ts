import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from 'src/app/service/cart.service';
import { ProductService } from 'src/app/service/product.service';

@Component({
  selector: 'app-buy-product',
  templateUrl: './buy-product.component.html',
  styleUrls: ['./buy-product.component.css']
})
export class BuyProductComponent implements OnInit {
  product: any = {};
  selectedVariant: any = {};
  selectedImage = '';
  quantity = 1;
  selectedFinish = '';
  isAuthOpen = false;
  pendingAddToCart = false;
  similarProducts: any[] = [];
  categoryId: any;
  constructor(private cartService: CartService, private toastr: ToastrService, private productService: ProductService,
    private router: Router

  ) { }
  ngOnInit(): void {
    const buyProduct = history.state;

    if (buyProduct?.product) {

      this.product = buyProduct.product;
      console.log(this.product, 'histroy products');

      this.selectedImage =
        this.product?.images?.[0] || '';
      this.categoryId = this.product.category?._id;
      console.log(this.categoryId, 'category id');
      this.getCategoryIdByProductDetails();

    }

    if (buyProduct?.selectedVariant) {

      this.selectedVariant =
        buyProduct.selectedVariant;
      this.selectedFinish =
        this.selectedVariant?.metalColor || '';

    }


  }
  changeImage(img: string) {

    this.selectedImage = img;

  }

  updateQty(type: number) {

    if (type === -1 && this.quantity > 1) {

      this.quantity--;

    }

    if (type === 1) {

      this.quantity++;

    }
  }
  addToCart() {

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

    const payload = {

      user: userId,

      product: this.product._id,

      variantId: this.selectedVariant._id,

      quantity: this.quantity

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

        error: (err) => {

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
      isLoggedIn && this.pendingAddToCart
    ) {

      this.pendingAddToCart = false;

    }

  }


  getCategoryIdByProductDetails() {
    this.productService.getCategoryidByProducts(this.categoryId)
      .subscribe({
        next: (res: any) => {

          this.similarProducts = res?.data || null;
          console.log(this.similarProducts, 'similarproducts by products');

        },

        error: (err) => {
          console.log(err);
        }

      });
  }

  productDetails(id: string) {
    this.router.navigate(["/product", id]);
  }

  proceedToPayment() {
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
    this.router.navigate(["/proceed-payment"]);
  }


}