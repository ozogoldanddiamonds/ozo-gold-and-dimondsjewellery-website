import { AfterViewInit, Component } from '@angular/core';
import Swiper from 'swiper';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
SwiperCore.use([Navigation, Pagination, Autoplay]);
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

  collections = [
    { name: 'Gold', image: 'assets/images/gold.jpg' },
    { name: 'Diamond', image: 'assets/images/diamond.jpg' },
    { name: 'Rings', image: 'assets/images/rings.jpg' },
    { name: 'Silver', image: 'assets/images/silver.webp' },
    { name: 'Gold', image: 'assets/images/gold.jpg' },
    { name: 'Diamond', image: 'assets/images/diamond.jpg' },
    { name: 'Rings', image: 'assets/images/rings.jpg' },
    { name: 'Silver', image: 'assets/images/silver.webp' }
  ];

  featureProducts = [
    { name: 'Gold', image: 'assets/images/gold.jpg' },
    { name: 'Diamond', image: 'assets/images/diamond.jpg' },
    { name: 'Rings', image: 'assets/images/rings.jpg' },
    { name: 'Silver', image: 'assets/images/silver.webp' },
    { name: 'Gold', image: 'assets/images/gold.jpg' },
    { name: 'Diamond', image: 'assets/images/diamond.jpg' }
  ]
  products = [
    { name: 'Diamond Ring', price: 259, image: 'assets/images/rings.jpg' },
    { name: 'Gold Ring', price: 200, image: 'assets/images/gold.jpg' },
    { name: 'Diamond Earrings', price: 250, image: 'assets/images/diamond.jpg' },
    { name: 'Silver Necklace', price: 180, image: 'assets/images/silver.webp' },

    { name: 'Diamond Ring', price: 259, image: 'assets/images/rings.jpg' },
    { name: 'Gold Ring', price: 200, image: 'assets/images/gold.jpg' },
    { name: 'Diamond Earrings', price: 250, image: 'assets/images/diamond.jpg' },
    { name: 'Silver Necklace', price: 180, image: 'assets/images/silver.webp' }
  ];

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
  ngAfterViewInit() {
    setTimeout(() => {
      new Swiper('.mySwiper', {

        slidesPerView: 4,
        spaceBetween: 20,
        loop: true,

        autoplay: {
          delay: 2500,
          disableOnInteraction: false,
        },

        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },

        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },

        breakpoints: {
          320: { slidesPerView: 1 },
          576: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          992: { slidesPerView: 4 }
        }

      });
    }, 0);
  }
}
