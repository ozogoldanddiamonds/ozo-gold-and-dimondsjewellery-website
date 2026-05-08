import { Component } from '@angular/core';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {
  openAcc: string | null = null;
  images = [
    'assets/images/gold.jpg',
    'assets/images/diamond.jpg',
    'assets/images/rings.jpg',
    'assets/images/silver.webp',
  ];


  toggleAcc(section: string) {
    this.openAcc = this.openAcc === section ? null : section;
  }

  selectedImage = this.images[0];
}
