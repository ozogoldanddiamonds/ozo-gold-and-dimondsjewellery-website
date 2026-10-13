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
  categories: any[] = [];
  subCategories: any[] = [];
  subSubCategories: any[] = [];

  isAuthOpen = false;
  loading = false;
  categoryId = '';

  page = 1;
  limit = 10;
  hasMoreData = true;

  selectedCategory = '';
  selectedSubCategory = '';
  selectedSubSubCategory = '';
  selectedSort = 'latest';
  selectedProductType = '';
  minPrice: any = '';
  maxPrice: any = '';

  showFilter = false;
  showFilterDrawer = false;
  showSortSheet = false;
  pendingAddToCart = false;
  errorMessage = '';

  wishlistId = '';
  wishlistMap: { [key: string]: string } = {};
  wishlistRefreshSub?: Subscription;
  routeSub?: Subscription;

  product: any = null;
  selectedVariant: any = null;
  productId = '';

  showVariantPopup = false;
  selectedProduct: any = null;
  selectedVariantId = '';
  selectedVariantSize = '';
  availablePurities: string[] = [];
  selectedPurity = '';
  filteredVariants: any[] = [];

  private requestSequence = 0;

  constructor(
    private route: ActivatedRoute,
    private categoriesService: CategoriesService,
    private productService: ProductService,
    private wishlistService: WishlistService,
    private loaderService: LoadingService,
    public router: Router,
    private toastr: ToastrService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || '';
      this.selectedSubCategory = params['subCategory'] || '';
      this.selectedSubSubCategory = params['subSubCategory'] || '';
      this.selectedProductType = params['productType'] || '';
      this.minPrice = params['minPrice'] ?? '';
      this.maxPrice = params['maxPrice'] ?? '';
      this.selectedSort = params['sort'] || 'latest';

      this.resetPagination();
      this.getProducts();
    });

    this.getAllCategories();

    this.wishlistRefreshSub = this.wishlistService.wishlistRefresh$.subscribe(refresh => {
      if (refresh) {
        this.loadWishlistStatus();
        this.wishlistService.resetWishlistRefresh();
      }
    });
  }

  ngOnDestroy(): void {
    this.wishlistRefreshSub?.unsubscribe();
    this.routeSub?.unsubscribe();

    if (this.categorySwiper) {
      this.categorySwiper.destroy(true, true);
    }
  }

  private resetPagination(): void {
    this.page = 1;
    this.products = [];
    this.hasMoreData = true;
    this.errorMessage = '';
  }

  private sortPurities(purities: string[]): string[] {
    return [...new Set(purities.map(value => String(value || '').trim().toUpperCase()).filter(Boolean))]
      .sort((a, b) => {
        const valueA = Number.parseFloat(a.replace(/[^0-9.]/g, ''));
        const valueB = Number.parseFloat(b.replace(/[^0-9.]/g, ''));

        if (Number.isNaN(valueA) && Number.isNaN(valueB)) {
          return a.localeCompare(b);
        }
        if (Number.isNaN(valueA)) return 1;
        if (Number.isNaN(valueB)) return -1;
        return valueA - valueB;
      });
  }

  initCategorySwiper(): void {
    if (this.categorySwiper) {
      this.categorySwiper.destroy(true, true);
    }

    this.categorySwiper = new Swiper('.categorySwiper', {
      slidesPerView: 6,
      spaceBetween: 15,
      breakpoints: {
        320: { slidesPerView: 3.2 },
        576: { slidesPerView: 4 },
        768: { slidesPerView: 5 },
        992: { slidesPerView: 6 }
      }
    });
  }

  getVariantId(variant: any): string {
    return variant?._id || variant?.id || '';
  }

  getVariantPrice(variant: any): number {
    const value = variant?.priceDetails?.finalPrice ??
      variant?.calculatedPrice ??
      variant?.priceBreakup?.finalPrice ??
      0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  getDefaultVariant(product: any): any {
    if (!product?.variants?.length) return null;
    return product.variants.find((variant: any) => variant?.isDefault) || product.variants[0];
  }

  mapProduct(item: any): any {
    const variants = item?.variants || [];

    const sortedVariants = [...variants].sort((a: any, b: any) => {
      const priceA = Number(
        a?.priceDetails?.finalPrice ??
        a?.calculatedPrice ??
        0
      );

      const priceB = Number(
        b?.priceDetails?.finalPrice ??
        b?.calculatedPrice ??
        0
      );

      return priceA - priceB;
    });

    const defaultVariant = this.getDefaultVariant(item);

    const cheapestVariant = sortedVariants[0] || defaultVariant;

    return {
      ...item,
      image: item?.images?.[0] || 'assets/images/placeholder.png',
      categoryName: item?.category?.name || '',
      subCategoryName: item?.subCategory?.name || '',
      selectedVariant: defaultVariant,
      displayPrice:
        cheapestVariant?.priceDetails?.finalPrice ??
        cheapestVariant?.calculatedPrice ??
        0,
      oldPrice: cheapestVariant?.priceDetails?.metalValue || 0,
      discountPercentage: cheapestVariant?.discountPercentage || 0,
      isWishlisted: false,
      wishlistItemId: null
    };
  }

  getAllCategories(): void {
    this.categoriesService.getAllCategories().subscribe({
      next: (res: any) => {
        this.categories = res?.data || [];
        setTimeout(() => this.initCategorySwiper(), 100);
      },
      error: (err: any) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  getProducts(loadMore: boolean = false): void {
    if (this.loading) {
      // Avoid overlapping requests. The latest filter request is handled by the
      // request sequence below after the current request completes.
    }

    const requestId = ++this.requestSequence;
    this.loading = true;
    this.errorMessage = '';

    if (!loadMore) {
      this.loaderService.show();
    }

    const query: any = {
      page: this.page,
      limit: this.limit,
      sort: this.selectedSort || 'latest'
    };

    if (this.selectedCategory) query.category = this.selectedCategory;
    if (this.selectedSubCategory) query.subCategory = this.selectedSubCategory;
    if (this.selectedSubSubCategory) query.subSubCategory = this.selectedSubSubCategory;
    if (this.selectedProductType) query.productType = this.selectedProductType;
    if (this.minPrice !== '' && this.minPrice !== null && this.minPrice !== undefined) {
      query.minPrice = this.minPrice;
    }
    if (this.maxPrice !== '' && this.maxPrice !== null && this.maxPrice !== undefined) {
      query.maxPrice = this.maxPrice;
    }

    this.productService.getProductsByCategory(query).subscribe({
      next: (res: any) => {
        if (requestId !== this.requestSequence) return;

        this.loading = false;
        this.loaderService.hide();

        const rawProducts: any[] = Array.isArray(res?.data) ? res.data : [];
        const incomingProducts = rawProducts.map(item => this.mapProduct(item));

        // Build category child options from the returned results. If the backend
        // returns paginated data, these options reflect the current result page.
        const subCategoryMap = new Map<string, any>();
        const subSubCategoryMap = new Map<string, any>();

        rawProducts.forEach(item => {
          if (item?.subCategory?._id) {
            subCategoryMap.set(String(item.subCategory._id), item.subCategory);
          }
          if (item?.subSubCategory?._id) {
            subSubCategoryMap.set(String(item.subSubCategory._id), item.subSubCategory);
          }
        });

        this.subCategories = Array.from(subCategoryMap.values());
        this.subSubCategories = Array.from(subSubCategoryMap.values());

        this.products = loadMore
          ? [...this.products, ...incomingProducts]
          : incomingProducts;

        // Prefer backend pagination metadata when present.
        if (typeof res?.hasMore === 'boolean') {
          this.hasMoreData = res.hasMore;
        } else if (typeof res?.pagination?.hasMore === 'boolean') {
          this.hasMoreData = res.pagination.hasMore;
        } else {
          this.hasMoreData = incomingProducts.length >= this.limit;
        }

        if (!this.products.length) {
          this.errorMessage = res?.message || 'No products found';
        }

        this.loadWishlistStatus();
      },
      error: (err: any) => {
        if (requestId !== this.requestSequence) return;

        this.loading = false;
        this.loaderService.hide();
        this.errorMessage = err?.error?.message || 'Unable to load products. Please try again.';
        console.error('Failed to load products:', err);
      }
    });
  }

  filterByCategory(categoryId: string): void {
    this.selectedCategory = categoryId || '';
    this.categoryId = categoryId || '';
    this.selectedSubCategory = '';
    this.selectedSubSubCategory = '';

    this.resetPagination();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory || null,
        subCategory: null,
        subSubCategory: null,
        productType: this.selectedProductType || null,
        minPrice: this.minPrice || null,
        maxPrice: this.maxPrice || null,
        sort: this.selectedSort !== 'latest' ? this.selectedSort : null
      },
      queryParamsHandling: ''
    });
  }

  filterBySubCategory(id: string): void {
    this.selectedSubCategory = id || '';
    this.selectedSubSubCategory = '';
    this.resetPagination();
    this.getProducts();
  }

  filterBySubSubCategory(id: string): void {
    this.selectedSubSubCategory = id || '';
    this.resetPagination();
    this.getProducts();
  }

  applyFilters(): void {
    this.resetPagination();
    this.getProducts();
    this.closeOffcanvas('filterCanvas');
  }

  clearFilters(): void {
    const currentParams = this.route.snapshot.queryParams;
    const hadFilterParams = [
      'category',
      'subCategory',
      'subSubCategory',
      'productType',
      'minPrice',
      'maxPrice',
      'sort'
    ].some(key => !!currentParams[key]);

    this.selectedCategory = '';
    this.categoryId = '';
    this.selectedSubCategory = '';
    this.selectedSubSubCategory = '';
    this.selectedProductType = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.selectedSort = 'latest';

    this.resetPagination();

    // When URL filters exist, queryParams subscription reloads all products.
    // If URL is already clear, trigger the request directly.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: null,
        subCategory: null,
        subSubCategory: null,
        productType: null,
        minPrice: null,
        maxPrice: null,
        sort: null
      },
      queryParamsHandling: ''
    }).then(() => {
      if (!hadFilterParams) {
        this.resetPagination();
        this.getProducts();
      }
    });

    this.closeOffcanvas('filterCanvas');
  }

  onSortChange(): void {
    this.resetPagination();
    this.getProducts();
  }

  toggleSort(): void {
    if (this.selectedSort === 'latest') {
      this.selectedSort = 'lowToHigh';
    } else if (this.selectedSort === 'lowToHigh') {
      this.selectedSort = 'highToLow';
    } else {
      this.selectedSort = 'latest';
    }

    this.resetPagination();
    this.getProducts();
  }

  selectSort(sort: string): void {
    this.selectedSort = sort || 'latest';
    this.resetPagination();
    this.getProducts();
    this.closeOffcanvas('sortCanvas');
  }

  loadMoreProducts(): void {
    if (this.loading || !this.hasMoreData) return;
    this.page++;
    this.getProducts(true);
  }

  getWishlistKey(productId: string, variantId: string): string {
    return `${productId}_${variantId}`;
  }

  loadWishlistStatus(): void {
    const userId = localStorage.getItem('userId');

    if (!userId || !this.products?.length) {
      this.products = this.products.map(product => ({
        ...product,
        isWishlisted: false,
        wishlistItemId: null
      }));
      return;
    }

    this.wishlistService.getWishlist(userId).subscribe({
      next: (res: any) => {
        this.wishlistId = res?.wishlistId || '';
        const items = res?.items || [];
        this.wishlistMap = {};

        items.forEach((item: any) => {
          const productId = item?.productId?._id || item?.productId;
          const variantId = item?.variantId?._id || item?.variantId;

          if (productId && variantId) {
            this.wishlistMap[this.getWishlistKey(String(productId), String(variantId))] =
              item?.wishlistItemId || item?._id;
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
        console.error('Failed to load wishlist:', err);
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

  toggleWishlist(item: any): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.toastr.warning('Please login first');
      this.router.navigate(['/login']);
      return;
    }

    const selectedVariant = item?.selectedVariant || this.getDefaultVariant(item);
    const variantId = typeof selectedVariant === 'string'
      ? selectedVariant
      : this.getVariantId(selectedVariant);

    if (!item?._id || !variantId) {
      this.toastr.warning('Variant not found');
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
          console.error(err);
          this.toastr.warning(err?.error?.message || 'Failed to remove wishlist');
        }
      });
    } else {
      const payload = {
        user: userId,
        product: item._id,
        variantId
      };

      this.wishlistService.addToWishlist(payload).subscribe({
        next: () => {
          item.isWishlisted = true;
          this.wishlistService.refreshWishlist();
          this.loadWishlistStatus();
        },
        error: (err: any) => {
          console.error(err);

          if (err?.error?.message === 'Product already in wishlist') {
            item.isWishlisted = true;
            this.loadWishlistStatus();
          } else {
            this.toastr.warning(err?.error?.message || 'Failed to add wishlist');
          }
        }
      });
    }
  }

  loadWishlistCount(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.wishlistService.getWishlist(userId).subscribe({
      next: (res: any) => {
        this.wishlistService.updateWishlistCount(res?.items?.length || 0);
      },
      error: () => this.wishlistService.updateWishlistCount(0)
    });
  }

  openVariantPopup(item: any): void {
    this.selectedProduct = item;
    const variants = Array.isArray(item?.variants) ? item.variants : [];

    this.availablePurities = this.sortPurities(
      variants.map((variant: any) => variant?.metalPurity)
        .filter((purity: any) => purity !== null && purity !== undefined && String(purity).trim() !== '')
    );

    const defaultVariant = item?.selectedVariant || this.getDefaultVariant(item);
    this.selectedPurity = String(defaultVariant?.metalPurity || this.availablePurities[0] || '').toUpperCase();

    this.filterVariantsByPurity();
    this.showVariantPopup = true;
  }

  filterVariantsByPurity(): void {
    if (!this.selectedProduct) {
      this.filteredVariants = [];
      return;
    }

    const variants = Array.isArray(this.selectedProduct?.variants)
      ? this.selectedProduct.variants
      : [];

    this.filteredVariants = variants.filter((variant: any) =>
      String(variant?.metalPurity || '').trim().toUpperCase() ===
      String(this.selectedPurity || '').trim().toUpperCase()
    );

    if (this.filteredVariants.length) {
      const currentStillAvailable = this.filteredVariants.find(
        (variant: any) => this.getVariantId(variant) === this.selectedVariantId
      );

      this.selectVariant(currentStillAvailable || this.filteredVariants[0]);
    } else {
      this.selectedVariant = null;
      this.selectedVariantId = '';
      this.selectedVariantSize = '';
    }
  }

  selectPurity(purity: string): void {
    this.selectedPurity = String(purity || '').trim().toUpperCase();
    this.filterVariantsByPurity();
  }

  selectVariant(variant: any): void {
    this.selectedVariant = variant;
    this.selectedVariantId = this.getVariantId(variant);
    this.selectedVariantSize = variant?.size || '';
  }

  closeVariantPopup(): void {
    this.showVariantPopup = false;
    this.selectedProduct = null;
    this.selectedVariant = null;
    this.selectedVariantId = '';
    this.selectedVariantSize = '';
    this.selectedPurity = '';
    this.filteredVariants = [];
  }

  confirmAddToCart(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.toastr.warning('Please login first');
      this.openLoginModal();
      return;
    }

    if (!this.selectedProduct?._id || !this.selectedVariantId) {
      this.toastr.warning('Please select an available variant');
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
        this.toastr.success('Added to cart');
      },
      error: (err: any) => {
        this.loading = false;
        console.error(err);
        this.toastr.warning(err?.error?.message || 'Failed to add cart');
      }
    });
  }

  openLoginModal(): void {
    this.isAuthOpen = true;
    this.closeVariantPopup();
  }

  closeAuthModal(isLoggedIn?: boolean): void {
    this.isAuthOpen = false;

    if (isLoggedIn && this.pendingAddToCart) {
      this.pendingAddToCart = false;
      this.confirmAddToCart();
    }
  }

  viewProduct(id: string): void {
    this.router.navigate(['/product', id]);
  }

  getDiscount(mrp: number, price: number): number {
    if (!mrp || !price || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  }

  closeOffcanvas(id: string): void {
    const element = document.getElementById(id);
    if (!element || typeof bootstrap === 'undefined') return;

    const instance = bootstrap.Offcanvas.getInstance(element) ||
      new bootstrap.Offcanvas(element);
    instance.hide();
  }


}
