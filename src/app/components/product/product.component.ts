import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from 'src/app/service/cart.service';
import { LoadingService } from 'src/app/service/loading.service';
import { ProductService } from 'src/app/service/product.service';
import { SizeChartsService } from 'src/app/service/size-charts.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  quantity: number = 1;
  openAcc: string | null = null;
  errorMessage = '';
  product: any = null;
  selectedVariant: any = null;
  selectedImage: any;
  purityOptions: string[] = [];
  cartItems: any[] = [];
  cartId: string = '';
  cartCount: number = 0;
  sizeOptions: string[] = [];
  similarProducts: any[] = [];
  selectedSize: string = '';
  subCategoryId: any;
  categoryId: any;
  sizeChart: any = null;
  isSizeChartModalOpen = false;
  isCertificateModalOpen = false;
  selectedPurity: string = '';

  filteredVariants: any[] = [];

  productId: string = '';
  isAuthOpen = false;

  pendingAddToCart = false;
  constructor(public router: Router, private route: ActivatedRoute,
    private loaderService: LoadingService, private productService: ProductService,
    private cartService: CartService, private sizeChartService: SizeChartsService,
    private toastr: ToastrService,
  ) { }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productId = id;
        this.getProductDetails();
      }
    });
    this.getCategoryIdByProductDetails();
  }
  getProductDetails() {
    this.loaderService.show();
    this.errorMessage = '';

    this.productService.getProductById(this.productId).subscribe({
      next: (res: any) => {

        this.loaderService.hide();
        this.product = this.normalizeProduct(res?.data);
        this.subCategoryId = this.product.subCategory._id;
        this.categoryId = this.product.category._id;
        console.log(this.categoryId, 'categoryid');
        console.log(this.subCategoryId, 'subcategory id');

        if (this.product?.images?.length) {

          this.selectedImage =
            this.product.images[0];

        }

        if (this.product?.variants?.length) {

          this.purityOptions = [

            ...new Set<string>(
              this.product.variants.map(
                (v: any) => String(v.metalPurity)
              )
            )

          ];

          this.selectedPurity =
            this.purityOptions[0];

          this.loadSizesByPurity();

          this.filteredVariants =

            this.product.variants.filter(
              (v: any) =>
                v.metalPurity ===
                this.selectedPurity
            );

          this.selectedVariant =
            this.filteredVariants[0];

        }
        this.getSizeCharts();
        this.getCategoryIdByProductDetails();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load product details';
      }
    });
  }
  selectPurity(purity: string) {

    this.selectedPurity = purity;

    this.loadSizesByPurity();

  }
  selectVariant(variant: any) {

    this.selectedVariant = variant;

  }
  toggleAcc(section: string) {
    this.openAcc = this.openAcc === section ? null : section;
  }



  whishlist() {
    this.router.navigate(["/whishlist"]);
  }

  normalizeProduct(product: any) {
    if (!product) return null;

    return {
      ...product,
      images: (product.images || []).map((img: string) => this.cleanUrl(img)),
      video: this.cleanUrl(product.video),
      variants: (product.variants || []).map((variant: any) => ({
        ...variant,
        diamonds: (variant.diamonds || []).map((diamond: any) => ({
          ...diamond,
          certificateUrl: this.cleanUrl(diamond.certificateUrl)
        }))
      }))
    };
  }

  cleanUrl(url: string): string {
    if (!url) return '';
    return url.replace(/^\[|\]$/g, '').replace(/\((.*?)\)/, '$1');
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

      this.toastr.warning(
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

          this.toastr.success(
            'Cart quantity updated successfully'
          );

          this.loaderService.hide();

        },

        error: (err) => {

          this.loaderService.hide();

          this.toastr.error(

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

          this.toastr.success(
            'Item removed from cart'
          );

          this.loaderService.hide();

        },

        error: (err) => {

          this.loaderService.hide();

          this.toastr.error(

            err?.error?.message ||

            'Failed to remove item'

          );

        }

      });

  }
  loadSizesByPurity() {

    const variantsByPurity =
      this.product.variants.filter(
        (v: any) =>
          v.metalPurity ===
          this.selectedPurity
      );

    this.sizeOptions = Array.from(

      new Set(
        variantsByPurity.map(
          (v: any) => String(v.size)
        )
      )

    ) as string[];

    if (this.sizeOptions.length) {

      this.selectedSize =
        this.sizeOptions[0];

      this.selectSize(
        this.selectedSize
      );

    }

  }
  selectSize(size: string) {

    this.selectedSize = size;

    const variant =
      this.product.variants.find(
        (v: any) =>

          v.metalPurity ===
          this.selectedPurity &&

          v.size === size
      );

    if (variant) {

      this.selectedVariant =
        variant;

    }

  }

  openLoginModal() {

    this.isAuthOpen = true;

  }
  closeAuthModal(isLoggedIn?: boolean) {

    this.isAuthOpen = false;

    if (
      isLoggedIn &&
      this.pendingAddToCart
    ) {

      this.pendingAddToCart = false;

      this.addToCart();

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



  buyProduct() {
    this.router.navigate(['/buy-product'], {
      state: {
        product: this.product,
        selectedVariant: this.selectedVariant
      }
    });
  }

  getSizeCharts() {
    this.sizeChartService.getSizeChartBySubCategory(this.subCategoryId)
      .subscribe({
        next: (res: any) => {

          this.sizeChart = res?.data || null;

        },

        error: (err) => {
          console.log(err);
        }

      });
  }

  openSizeChart() {
    this.isSizeChartModalOpen = true;
  }
  openCertificate() {
    this.isCertificateModalOpen = true;
  }
  closeCertificate() {
    this.isCertificateModalOpen = false;
  }
  closeSizeChart() {
    this.isSizeChartModalOpen = false;
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


}
