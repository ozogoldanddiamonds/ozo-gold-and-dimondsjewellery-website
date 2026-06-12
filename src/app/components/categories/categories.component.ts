import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/service/cart.service';
import { CategoriesService } from 'src/app/service/categories.service';
import { LoadingService } from 'src/app/service/loading.service';
import { ProductService } from 'src/app/service/product.service';
import { WishlistService } from 'src/app/service/wishlist.service';
import Swiper from 'swiper';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';

SwiperCore.use([Navigation, Pagination, Autoplay]);
declare var bootstrap: any;
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categorySwiper!: Swiper;

  products: any[] = [];
  isAuthOpen = false;
  loading = false;
  categoryId = '';
  page = 1;
  limit = 10;
  hasMoreData = true;
  categories: any[] = [];
  selectedCategory = '';
  selectedSort = 'latest';
  selectedProductType = '';
  minPrice: any = '';
  maxPrice: any = '';
  showFilter = false;
  showFilterDrawer = false;
  pendingAddToCart = false;

  wishlistId: string = '';
  wishlistMap: { [key: string]: string } = {};
  wishlistRefreshSub!: Subscription;
  routeSub!: Subscription;

  showSortSheet = false;

  product: any = null;
  selectedVariant: any = null;
  productId: string = '';
  errorMessage = '';

  showVariantPopup = false;
  selectedProduct: any = null;
  selectedVariantId = '';
  selectedVariantSize = '';

  availablePurities: string[] = [];
  selectedPurity = '';
  filteredVariants: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private categoriesService: CategoriesService,
    private productService: ProductService,
    private wishlistService: WishlistService,
    private loaderService: LoadingService,
    public router: Router, private toastr: ToastrService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const categoryId = params['category'] || '';
      this.categoryId = categoryId;
      this.selectedCategory = categoryId;
      this.page = 1;
      this.products = [];
      this.hasMoreData = true;
      this.getProducts(categoryId);
    });

    this.getAllCategories();

    this.wishlistRefreshSub = this.wishlistService.wishlistRefresh$.subscribe((refresh) => {
      if (refresh) {
        this.loadWishlistStatus();
        this.wishlistService.resetWishlistRefresh();
      }
    });
  }
  initCategorySwiper() {

    if (this.categorySwiper) {

      this.categorySwiper.destroy(
        true,
        true
      );

    }

    this.categorySwiper =
      new Swiper('.categorySwiper', {

        slidesPerView: 6,

        spaceBetween: 15,

        breakpoints: {

          320: {
            slidesPerView: 3.2
          },

          576: {
            slidesPerView: 4
          },

          768: {
            slidesPerView: 5
          },

          992: {
            slidesPerView: 6
          }

        }

      });

  }
  ngOnDestroy(): void {
    if (this.wishlistRefreshSub) {
      this.wishlistRefreshSub.unsubscribe();
    }

    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  getVariantId(variant: any): string {
    return variant?._id || variant?.id || '';
  }

  getDefaultVariant(product: any): any {
    if (!product?.variants?.length) return null;
    return product.variants.find((v: any) => v?.isDefault) || product.variants[0];
  }

  mapProduct(item: any): any {
    const defaultVariant = this.getDefaultVariant(item);

    return {
      ...item,
      image: item?.images?.[0] || 'assets/images/placeholder.png',
      categoryName: item?.category?.name || '',
      subCategoryName: item?.subCategory?.name || '',
      selectedVariant: defaultVariant,
      displayPrice: defaultVariant?.priceDetails?.finalPrice || 0,
      oldPrice: defaultVariant?.priceDetails?.metalValue || 0,
      discountPercentage: defaultVariant?.discountPercentage || 0,
      isWishlisted: false,
      wishlistItemId: null
    };
  }

  openVariantPopup(item: any) {

    this.selectedProduct = item;

    this.availablePurities = [

      ...new Set<string>(

        item.variants.map(
          (v: any) =>
            v.metalPurity
        )

      )

    ];

    const defaultVariant =
      item?.selectedVariant ||
      item?.variants?.[0];

    this.selectedPurity =
      defaultVariant?.metalPurity;

    this.filterVariantsByPurity();

    this.showVariantPopup = true;

  }
  selectVariant(variant: any) {
    this.selectedVariant = variant;
    this.selectedVariantId = variant?._id || '';
  }

  closeVariantPopup() {
    this.showVariantPopup = false;
    this.selectedProduct = null;
    this.selectedVariant = null;
    this.selectedVariantId = '';
  }


  getProducts(categoryId?: string, loadMore: boolean = false) {
    this.loading = true;
    this.errorMessage = '';
    this.loaderService.show();

    const query: any = {
      page: this.page,
      limit: this.limit,
      sort: this.selectedSort,
      productType: this.selectedProductType,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    };

    if (categoryId) {
      query.category = categoryId;
    }

    this.productService.getProductsByCategory(query).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.loaderService.hide();

        const incomingProducts = (res?.products || res?.data || []).map((item: any) =>
          this.mapProduct(item)
        );

        if (loadMore) {
          this.products = [...this.products, ...incomingProducts];
        } else {
          this.products = incomingProducts;
        }

        this.hasMoreData = incomingProducts.length >= this.limit;

        if (!this.products.length) {
          this.errorMessage = 'No products found';
        }

        this.loadWishlistStatus();
      },
      error: (err: any) => {
        this.loading = false;
        this.loaderService.hide();
        this.errorMessage = err?.error?.message || 'Failed to fetch products';
        console.log(err);
      }
    });
  }

  getAllCategories() {
    this.categoriesService.getAllCategories().subscribe({
      next: (res: any) => {
        this.categories = res?.data || [];
        setTimeout(() => {

          this.initCategorySwiper();

        }, 100);
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  filterByCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.categoryId = categoryId;
    this.page = 1;
    this.products = [];
    this.hasMoreData = true;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: categoryId || null },
      queryParamsHandling: 'merge'
    });

    this.getProducts(categoryId);
  }

  clearFilters() {

    this.selectedProductType = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.selectedSort = 'latest';

    this.selectedCategory = '';
    this.categoryId = '';

    this.page = 1;
    this.products = [];
    this.hasMoreData = true;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: null
      },
      queryParamsHandling: 'merge'
    });

    this.getProducts();

    this.closeOffcanvas('filterCanvas');
  }

  toggleSort() {
    if (this.selectedSort === 'latest') {
      this.selectedSort = 'lowToHigh';
    } else if (this.selectedSort === 'lowToHigh') {
      this.selectedSort = 'highToLow';
    } else {
      this.selectedSort = 'latest';
    }

    this.page = 1;
    this.products = [];
    this.hasMoreData = true;
    this.getProducts(this.selectedCategory);
  }

  selectSort(sort: string) {
    this.selectedSort = sort;
    this.page = 1;
    this.products = [];
    this.hasMoreData = true;
    this.getProducts(this.selectedCategory);
    this.closeOffcanvas('sortCanvas');
  }

  onSortChange() {
    this.page = 1;
    this.products = [];
    this.hasMoreData = true;
    this.getProducts(this.selectedCategory);
  }

  applyFilters() {
    this.page = 1;
    this.products = [];
    this.hasMoreData = true;
    this.getProducts(this.selectedCategory);
    this.closeOffcanvas('filterCanvas');
  }

  loadMoreProducts() {
    if (this.loading || !this.hasMoreData) return;
    this.page++;
    this.getProducts(this.selectedCategory || this.categoryId, true);
  }

  getWishlistKey(productId: string, variantId: string) {
    return `${productId}_${variantId}`;
  }

  loadWishlistStatus() {
    const userId = localStorage.getItem('userId');
    if (!userId || !this.products?.length) return;

    this.wishlistService.getWishlist(userId).subscribe({
      next: (res: any) => {
        this.wishlistId = res?.wishlistId || '';
        const items = res?.items || [];
        this.wishlistMap = {};

        items.forEach((item: any) => {
          const productId = item?.productId;
          const variantId = item?.variantId;

          if (productId && variantId) {
            const key = this.getWishlistKey(productId, variantId);
            this.wishlistMap[key] = item?.wishlistItemId;
          }
        });

        this.products = this.products.map(product => {
          const selectedVariant = product?.selectedVariant || this.getDefaultVariant(product);
          const variantId = this.getVariantId(selectedVariant);
          const key = this.getWishlistKey(product?._id, variantId);

          return {
            ...product,
            selectedVariant,
            isWishlisted: !!this.wishlistMap[key],
            wishlistItemId: this.wishlistMap[key] || null
          };
        });
      },
      error: (err: any) => {
        console.log(err);

        if (err?.status === 404) {
          this.wishlistId = '';
          this.wishlistMap = {};
          this.products = this.products.map(product => ({
            ...product,
            isWishlisted: false,
            wishlistItemId: null
          }));
        }
      }
    });
  }

  toggleWishlist(item: any) {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.toastr.warning(
        'Please login first'
      );
      this.router.navigate(['/login']);
      return;
    }

    const selectedVariant = item?.selectedVariant || this.getDefaultVariant(item);
    const variantId = typeof selectedVariant === 'string' ? selectedVariant : selectedVariant?._id;

    if (!variantId) {
      this.toastr.warning(
        'Variant not found'
      );
      return;
    }

    if (item.isWishlisted && this.wishlistId && item.wishlistItemId) {
      this.wishlistService.removeWishlistItem(this.wishlistId, item.wishlistItemId).subscribe({
        next: () => {
          item.isWishlisted = false;
          item.wishlistItemId = null;
          this.wishlistService.refreshWishlist();
          this.loadWishlistStatus();
        },
        error: (err: any) => {
          console.log(err);
          this.toastr.warning(
            err?.error?.message ||
            'Failed to remove wishlist'
          );
        }
      });
    } else {
      const payload = {
        user: userId,
        product: item?._id,
        variantId: variantId
      };

      this.wishlistService.addToWishlist(payload).subscribe({
        next: () => {
          item.isWishlisted = true;
          this.wishlistService.refreshWishlist();
          this.loadWishlistStatus();
        },
        error: (err: any) => {
          console.log(err);

          if (err?.error?.message === 'Product already in wishlist') {
            item.isWishlisted = true;
            this.loadWishlistStatus();
          } else {
            this.toastr.warning(
              err?.error?.message ||
              'Failed to add wishlist'
            );
          }
        }
      });
    }
  }

  loadWishlistCount() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.wishlistService.getWishlist(userId).subscribe({
      next: (res: any) => {
        this.wishlistService.updateWishlistCount(res?.items?.length || 0);
      },
      error: () => {
        this.wishlistService.updateWishlistCount(0);
      }
    });
  }

  openLoginModal() {

    this.isAuthOpen = true;
    this.closeVariantPopup();

  }

  confirmAddToCart() {
    const userId = localStorage.getItem('userId');

    if (!userId) {

      this.toastr.warning(
        'Please login first'
      );


      this.openLoginModal();

      return;
    }

    if (!this.selectedProduct?._id || !this.selectedVariantId) {
      this.toastr.warning(
        'Please login first'
      );
      return;
    }

    const payload = {
      user: userId,
      product: this.selectedProduct._id,
      variantId: this.selectedVariantId,
      quantity: 1
    };

    this.loading = true;

    this.cartService.addToCart(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showVariantPopup = false;
        this.cartService.loadCartCount();
        this.toastr.success(
          'Added to cart'
        );
      },
      error: (err: any) => {
        this.loading = false;
        console.log(err);
        this.toastr.warning(
          err?.error?.message || 'Failed to add cart'
        );
      }
    });
  }
  closeAuthModal(isLoggedIn?: boolean) {

    this.isAuthOpen = false;

    if (
      isLoggedIn &&
      this.pendingAddToCart
    ) {

      this.pendingAddToCart = false;

      this.confirmAddToCart();

    }

  }
  viewProduct(id: string) {
    this.router.navigate(["/product", id]);
  }

  getDiscount(mrp: number, price: number): number {
    if (!mrp || !price || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  }

  closeOffcanvas(id: string) {
    const element = document.getElementById(id);
    if (!element) return;

    const instance = bootstrap?.Offcanvas.getInstance(element) || new bootstrap.Offcanvas(element);
    instance.hide();
  }
  filterVariantsByPurity() {

    if (!this.selectedProduct) return;

    this.filteredVariants =
      this.selectedProduct.variants.filter(
        (v: any) =>
          v.metalPurity ===
          this.selectedPurity
      );

    if (this.filteredVariants.length) {

      this.selectedVariant =
        this.filteredVariants[0];

      this.selectedVariantId =
        this.filteredVariants[0]._id;

      this.selectedVariantSize =
        this.filteredVariants[0].size;

    }

  }

  selectPurity(purity: string) {

    this.selectedPurity =
      purity;

    this.filterVariantsByPurity();

  }

}
