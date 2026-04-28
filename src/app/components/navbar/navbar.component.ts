import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isCategoryOpen = false;
  isMenuOpen = false;
  toggleCategory() {
    this.isCategoryOpen = !this.isCategoryOpen;
  }
}
