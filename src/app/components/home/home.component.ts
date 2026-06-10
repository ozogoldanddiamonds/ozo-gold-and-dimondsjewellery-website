import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BannersService } from 'src/app/service/banners.service';
import { ProductService } from 'src/app/service/product.service';
import { WishlistService } from 'src/app/service/wishlist.service';
import Swiper from 'swiper';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
SwiperCore.use([Navigation, Pagination, Autoplay]);
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  banners: any[] = [];
  popularSwiper!: Swiper;
  featuredSwiper!: Swiper;
  newProducts: any[] = [];
  featureProducts: any[] = [];
  products: any[] = [];
  currentPage = 1;
  limit = 8;
  search = '';

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
    private wishlistService: WishlistService, private productService: ProductService) { }
  ngOnInit(): void {
    this.getAllBanners();
    this.getNewProducts();
    this.getProducts();
    this.getfeatureProducts();
    this.loadWishlist();
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
        320: { slidesPerView: 4 },
        576: { slidesPerView: 4 },
        768: { slidesPerView: 4 },
        992: { slidesPerView: 4 }
      }

    });

  }

  product(id: string) {
    this.router.navigate(["/product", id]);
  }
  getProducts() {

    this.productService
      .getAllProducts(
        this.currentPage,
        this.limit,
        this.search
      )
      .subscribe({

        next: (response: any) => {

          console.log(response);

          this.totalPages = response.totalPages || 0;

          this.totalPagesArray = Array(this.totalPages)
            .fill(0)
            .map((x, i) => i + 1);

          this.products =
            response.products ||
            response.data ||
            [];

        },

        error: (error) => {

          console.log(error);

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
    this.bannerService.getAllBanners().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.banners = res.data;
        }
      },
      error: (err) => {
        console.error('Banner Load Error:', err);
      }
    });
  }

  getNewProducts(): void {

    this.productService
      .getProductsByType('NEW')
      .subscribe({

        next: (res: any) => {

          console.log('New Products:', res);

          if (res.success) {

            this.newProducts = res.data;
            setTimeout(() => {
              this.initPopularSwiper();
            }, 100);
          }

        },

        error: (err) => {

          console.error(err);

        }

      });

  }
  getfeatureProducts() {

    this.productService
      .getProductsByType('FEATURED')
      .subscribe({

        next: (res: any) => {

          console.log('FEATURED PRODUCTS', res);

          if (res.success) {

            this.featureProducts = res.data;

            setTimeout(() => {

              this.initFeaturedSwiper();

            }, 100);

          }

        },

        error: (err) => {

          console.log(err);

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
}

