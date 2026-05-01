import { Component } from '@angular/core';

@Component({
  selector: 'app-whishlist',
  templateUrl: './whishlist.component.html',
  styleUrls: ['./whishlist.component.css']
})
export class WhishlistComponent {
  wishlist = [
    { name: 'Gold Ring', price: 25000, image: 'assets/images/gold.jpg' },
    { name: 'Diamond Necklace', price: 50000, image: 'assets/images/diamond.jpg' }
  ];

  remove(item: any) {
    this.wishlist = this.wishlist.filter(i => i !== item);
  }

  moveToCart(item: any) {
    console.log('Move to cart:', item);
  }
}
