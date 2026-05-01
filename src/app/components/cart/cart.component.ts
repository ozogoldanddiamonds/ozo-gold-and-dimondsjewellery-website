import { Component } from '@angular/core';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  cartItems = [
    { name: 'Gold Ring', price: 25000, qty: 1, image: 'assets/images/gold.jpg' },
    { name: 'Diamond Necklace', price: 50000, qty: 1, image: 'assets/images/diamond.jpg' }
  ];

  increase(item: any) {
    item.qty++;
  }

  decrease(item: any) {
    if (item.qty > 1) item.qty--;
  }
  remove(item: any) {
    this.cartItems = this.cartItems.filter(i => i !== item);
  }

  getSubtotal() {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  }
}
