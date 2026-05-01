import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  constructor(public router: Router) { }
  products = [
    { name: 'Gold Ring', price: 25000, image: 'assets/images/gold.jpg' },
    { name: 'Diamond Ring', price: 55000, image: 'assets/images/diamond.jpg' },
    { name: 'Silver Chain', price: 8000, image: 'assets/images/silver.webp' },
    { name: 'Necklace', price: 45000, image: 'assets/images/gold.jpg' },
    { name: 'Earrings', price: 15000, image: 'assets/images/rings.jpg' },
    { name: 'Bracelet', price: 12000, image: 'assets/images/gold.jpg' }
  ];

  product() {
    this.router.navigate(["/product"]);
  }
}
