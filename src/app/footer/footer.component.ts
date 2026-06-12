import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  isAuthOpen = false;
  constructor() { }
  openAuthModal() {
    this.isAuthOpen = true;
  }

  closeAuthModal(isLoggedIn?: boolean) {
    this.isAuthOpen = false;
  }
}
