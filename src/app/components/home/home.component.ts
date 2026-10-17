import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BannersService } from 'src/app/service/banners.service';
import { CategoriesService } from 'src/app/service/categories.service';
import { LoadingService } from 'src/app/service/loading.service';
import { ProductService } from 'src/app/service/product.service';
import { SubcategoryService } from 'src/app/service/subcategory.service';
import { WishlistService } from 'src/app/service/wishlist.service';
import Swiper from 'swiper';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import { Meta, Title } from '@angular/platform-browser';
import { MetaKeywordsService } from 'src/app/service/meta-keywords.service';
import { DOCUMENT } from '@angular/common';
SwiperCore.use([Navigation, Pagination, Autoplay]);
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  subSubCategories: any[] = [];
  categoryGroups: any[][] = [];



  banners: any[] = [];
  allProducts: any[] = [];

  categoriesList: any[] = [];

  subCategoriesList: any[] = [];
  allSubCategories: any[] = [];

  subSubCategoriesList: any[] = [];
  allSubSubCategories: any[] = [];

  products: any[] = [];
  categorySwiper!: Swiper;
  subCategorySwiper!: Swiper;
  subSubCategorySwiper!: Swiper;
  popularSwiper!: Swiper;
  featuredSwiper!: Swiper;
  newProducts: any[] = [];
  featureProducts: any[] = [];
  currentPage = 1;
  limit = 8;
  search = '';
  isAuthOpen = false;
  totalPages = 0;
  totalPagesArray: number[] = [];
  wishlistId: string = '';

  wishlistMap: { [key: string]: string } = {};

  news = [
    {
      month: 'JULY',
      day: '08',
      title: 'Sample Blog Post With Left Sidebar',
      author: 'Admin',
      comments: '0 Comments',
      desc: 'Latest jewellery trends and styles for modern fashion...'
    },
    {
      month: 'JUNE',
      day: '30',
      title: 'Vel Illum Qui Dolorem Eum Fugiat',
      author: 'Admin',
      comments: '1 Comment',
      desc: 'Explore new arrivals and timeless gold collections...'
    },
    {
      month: 'JUNE',
      day: '30',
      title: 'Sample Blog Post Full Width',
      author: 'Admin',
      comments: '0 Comments',
      desc: 'Discover handcrafted jewellery pieces with elegance...'
    }
  ];
  constructor(public router: Router, private bannerService: BannersService, private toastr: ToastrService,
    private wishlistService: WishlistService, private productService: ProductService, private subcategoryservices: SubcategoryService,
    private loaderService: LoadingService,
    private seoService: MetaKeywordsService,
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document) { }
  ngOnInit(): void {
    this.getAllBanners();
    this.getNewProducts();
    this.getProducts();
    this.getfeatureProducts();
    this.loadWishlist();
    this.getSubSubCategories();
    this.loadHomeSEO();
  }

  initFeaturedSwiper() {

    if (this.featuredSwiper) {
      this.featuredSwiper.destroy(true, true);
    }

    this.featuredSwiper = new Swiper('.featuredSwiper', {

      slidesPerView: 4,
      spaceBetween: 25,
      loop: true,

      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },

      navigation: {
        nextEl: '.featuredSwiper .swiper-button-next',
        prevEl: '.featuredSwiper .swiper-button-prev',
      },

      pagination: {
        el: '.featuredSwiper .swiper-pagination',
        clickable: true,
      },

      breakpoints: {
        320: { slidesPerView: 2 },
        576: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        992: { slidesPerView: 4 }
      }

    });

  }

  initPopularSwiper() {

    if (this.popularSwiper) {
      this.popularSwiper.destroy(true, true);
    }

    this.popularSwiper = new Swiper('.popularSwiper', {

      slidesPerView: 4,
      spaceBetween: 10,
      loop: true,

      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },

      navigation: {
        nextEl: '.popularSwiper .swiper-button-next',
        prevEl: '.popularSwiper .swiper-button-prev',
      },

      pagination: {
        el: '.popularSwiper .swiper-pagination',
        clickable: true,
      },

      breakpoints: {
        320: { slidesPerView: 3 },
        576: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        992: { slidesPerView: 4 }
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

        slidesPerView: 5,

        spaceBetween: 20,


        breakpoints: {

          320: {
            slidesPerView: 2.2
          },

          576: {
            slidesPerView: 3
          },

          768: {
            slidesPerView: 4
          },

          992: {
            slidesPerView: 5
          }

        }

      });

  }
  initSubCategorySwiper() {

    if (this.subCategorySwiper) {

      this.subCategorySwiper.destroy(
        true,
        true
      );

    }


    this.subCategorySwiper =
      new Swiper('.subCategorySwiper', {

        slidesPerView: 5,

        spaceBetween: 20,


        breakpoints: {

          320: {
            slidesPerView: 2.2
          },

          576: {
            slidesPerView: 3
          },

          768: {
            slidesPerView: 4
          },

          992: {
            slidesPerView: 5
          }

        }

      });

  }
  initSubSubCategorySwiper() {

    if (this.subSubCategorySwiper) {

      this.subSubCategorySwiper.destroy(
        true,
        true
      );

    }


    this.subSubCategorySwiper =
      new Swiper('.subSubCategorySwiper', {

        slidesPerView: 5,

        spaceBetween: 20,


        breakpoints: {

          320: {
            slidesPerView: 2.2
          },

          576: {
            slidesPerView: 3
          },

          768: {
            slidesPerView: 4
          },

          992: {
            slidesPerView: 5
          }

        }

      });

  }

  product(id: string) {
    this.router.navigate(["/product", id]);
  }
  getProducts() {

    this.loaderService.show();
    this.productService
      .getAllProducts(
        this.currentPage,
        this.limit,
        this.search
      )
      .subscribe({

        next: (response: any) => {

          console.log(response);

          const products = response.data || [];



          // =====================
          // UNIQUE CATEGORY
          // =====================

          this.categoriesList = [

            ...new Map(

              products
                .filter((x: any) => x.category)
                .map((x: any) => [
                  x.category._id,
                  x.category
                ])

            ).values()

          ];

          // =====================
          // UNIQUE SUB CATEGORY
          // =====================

          this.subCategoriesList = [

            ...new Map(

              products
                .filter((x: any) => x.subCategory)
                .map((x: any) => [
                  x.subCategory._id,
                  x.subCategory
                ])

            ).values()

          ];


          // =====================
          // UNIQUE SUB SUB CATEGORY
          // =====================

          this.subSubCategoriesList = [

            ...new Map(

              products
                .filter((x: any) => x.subSubCategory)
                .map((x: any) => [
                  x.subSubCategory._id,
                  x.subSubCategory
                ])

            ).values()

          ];


          setTimeout(() => {

            this.initCategorySwiper();

            this.initSubCategorySwiper();

            this.initSubSubCategorySwiper();

          }, 100);
          this.loaderService.hide();
          this.totalPages = response.totalPages || 0;

          this.totalPagesArray = Array(this.totalPages)
            .fill(0)
            .map((x, i) => i + 1);

          this.products =
            response.products ||
            response.data ||
            [];
          this.loadWishlistStatus();
        },

        error: (error) => {

          console.log(error);
          this.loaderService.hide();
        }

      });

  }

  goToPage(page: number) {

    this.currentPage = page;

    this.getProducts();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  previousPage() {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.getProducts();

    }

  }

  nextPage() {

    if (this.currentPage < this.totalPages) {

      this.currentPage++;

      this.getProducts();

    }

  }
  getAllBanners(): void {
    this.loaderService.show();
    this.bannerService.getAllBanners().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.loaderService.hide();
          this.banners = res.data;
        }
      },
      error: (err) => {
        console.error('Banner Load Error:', err);
        this.loaderService.hide();
      }
    });
  }

  getNewProducts(): void {
    this.loaderService.show();
    this.productService
      .getProductsByType('NEW')
      .subscribe({

        next: (res: any) => {

          console.log('New Products:', res);

          if (res.success) {
            this.loaderService.hide();
            this.newProducts = res.data;
            setTimeout(() => {
              this.initPopularSwiper();
            }, 100);
          }

        },

        error: (err) => {

          console.error(err);
          this.loaderService.hide();
        }

      });

  }
  getfeatureProducts() {
    this.loaderService.show();
    this.productService
      .getProductsByType('FEATURED')
      .subscribe({

        next: (res: any) => {

          console.log('FEATURED PRODUCTS', res);

          if (res.success) {
            this.loaderService.hide();
            this.featureProducts = res.data;

            setTimeout(() => {

              this.initFeaturedSwiper();

            }, 100);

          }

        },

        error: (err) => {

          console.log(err);
          this.loaderService.hide();
        }

      });

  }
  loadWishlist() {

    this.loadWishlistStatus();

    this.wishlistService.wishlistRefresh$
      .subscribe(refresh => {

        if (refresh) {

          this.loadWishlistStatus();

          this.wishlistService
            .resetWishlistRefresh();

        }

      });
  }
  loadWishlistStatus() {
    const userId =
      localStorage.getItem('userId');
    if (!userId || !this.products?.length) {
      return;
    }

    this.wishlistService
      .getWishlist(userId)
      .subscribe({

        next: (res: any) => {
          this.wishlistId =
            res?.wishlistId || '';

          const items =
            res?.items || [];

          this.wishlistMap = {};

          items.forEach((item: any) => {

            this.wishlistMap[
              item.productId
            ] = item.wishlistItemId;

          });

          this.products =
            this.products.map(product => ({

              ...product,

              isWishlisted:
                !!this.wishlistMap[
                product._id
                ],

              wishlistItemId:
                this.wishlistMap[
                product._id
                ] || null

            }));

          this.wishlistService
            .updateWishlistCount(
              items.length
            );

        }

      });

  }
  whishlist(item: any) {

    const userId =
      localStorage.getItem('userId');

    if (!userId) {

      this.toastr.warning(
        'Please login first'
      );

      this.openLoginModal();

      return;
    }
    if (
      item.isWishlisted &&
      item.wishlistItemId
    ) {

      this.wishlistService
        .removeWishlistItem(

          this.wishlistId,

          item.wishlistItemId

        )
        .subscribe({

          next: () => {

            item.isWishlisted = false;

            item.wishlistItemId = null;

            this.toastr.success(
              'Removed from wishlist'
            );

            this.wishlistService
              .refreshWishlist();

          }

        });

    } else {

      const payload = {

        user: userId,

        product: item._id,

        variantId:
          item?.variants?.[0]?._id

      };

      this.wishlistService
        .addToWishlist(payload)
        .subscribe({

          next: () => {

            item.isWishlisted = true;

            this.toastr.success(
              'Added to wishlist'
            );

            this.wishlistService
              .refreshWishlist();

          }

        });

    }

  }


  openLoginModal() {

    this.isAuthOpen = true;

  }
  closeAuthModal(isLoggedIn?: boolean) {

    this.isAuthOpen = false;

  }
  goToCategory(id: any) {

    this.router.navigate(
      ['/categories'],
      {
        queryParams: {
          category: id
        }
      }
    );

  }


  goToSubCategory(id: any) {

    this.router.navigate(
      ['/categories'],
      {
        queryParams: {
          subCategory: id
        }
      }
    );

  }


  goToSubSubCategory(id: any) {

    this.router.navigate(
      ['/categories'],
      {
        queryParams: {
          subSubCategory: id
        }
      }
    );

  }
  createCategoryGroups(): void {

    this.categoryGroups = [];

    for (let i = 0; i < this.subSubCategories.length; i += 7) {

      this.categoryGroups.push(
        this.subSubCategories.slice(i, i + 7)
      );

    }

  }

  getSubSubCategories(): void {

    this.subcategoryservices.getAllSubCategories().subscribe({
      next: (res: any) => {

        this.subSubCategories =
          res?.data ||
          res?.result ||
          res ||
          [];

        this.createCategoryGroups();
      },

      error: (err) => {
        console.error(
          'Failed to load sub sub categories',
          err
        );
      }
    });

  }
  trackByCategory(index: number, item: any): any {
    return item._id || index;
  }

  loadHomeSEO(): void {
    this.seoService.getMetaKeywordsSEO().subscribe({
      next: (res: any) => {
        const seo = res?.data;

        if (!res?.success || !seo || seo.isActive === false) {
          return;
        }

        // 1. Page Title
        this.titleService.setTitle(seo.metaTitle || 'OZO Jewellery');

        // 2. Meta Description
        if (seo.metaDescription) {
          this.setMetaTag(
            'name',
            'description',
            seo.metaDescription
          );
        }

        // 3. Meta Keywords
        if (Array.isArray(seo.metaKeywords)) {
          this.setMetaTag(
            'name',
            'keywords',
            seo.metaKeywords.join(', ')
          );
        }

        // 4. Open Graph tags
        if (seo.ogTitle) {
          this.setMetaTag('property', 'og:title', seo.ogTitle);
        }

        if (seo.ogDescription) {
          this.setMetaTag(
            'property',
            'og:description',
            seo.ogDescription
          );
        }

        if (seo.ogImage) {
          this.setMetaTag('property', 'og:image', seo.ogImage);
        }

        // 5. Canonical URL
        if (seo.canonicalUrl) {
          let canonical = this.document.querySelector(
            'link[rel="canonical"]'
          ) as HTMLLinkElement | null;

          if (!canonical) {
            canonical = this.document.createElement('link');
            canonical.rel = 'canonical';
            this.document.head.appendChild(canonical);
          }

          canonical.href = seo.canonicalUrl;

          this.setMetaTag('property', 'og:url', seo.canonicalUrl);
        }

        // Debug: verify the API data
        console.log('SEO API DATA:', seo);
        console.log(
          'DESCRIPTION TAG:',
          this.metaService.getTag('name="description"')
        );
        console.log(
          'KEYWORDS TAG:',
          this.metaService.getTag('name="keywords"')
        );
      },

      error: (err: any) => {
        console.error('SEO API ERROR:', err);
      }
    });
  }

  private setMetaTag(
    attribute: 'name' | 'property',
    key: string,
    content: string
  ): void {
    const selector = `${attribute}="${key}"`;

    const existingTag = this.metaService.getTag(selector);

    if (existingTag) {
      this.metaService.updateTag({
        [attribute]: key,
        content
      });
    } else {
      this.metaService.addTag({
        [attribute]: key,
        content
      });
    }
  }

}


