import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(public router: Router) { }
  isAuthOpen = false;
  activeAuthTab: 'login' | 'register' = 'login';
  showLoginPassword = false;
  showRegisterPassword = false;
  isCategoryOpen = false;
  isMenuOpen = false;
  lastScrollTop = 0;
  toggleCategoryMenu() {
    this.isCategoryOpen = !this.isCategoryOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    const topHeader = document.getElementById('topHeader');
    const navbar = document.getElementById('mainNavbar');

    if (scrollTop > this.lastScrollTop) {
      // 🔽 Scroll down
      topHeader?.classList.add('hide');
    } else {
      // 🔼 Scroll up
      topHeader?.classList.remove('hide');
    }

    // Add shadow effect
    if (scrollTop > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
  closeMenu() {
    setTimeout(() => {
      const navbar = document.getElementById('navbarNav');
      navbar?.classList.remove('show');

      // 🔥 IMPORTANT FIX
      this.isMenuOpen = false;

    }, 200);
  }

  openAuthModal(tab: 'login' | 'register' = 'login') {
    this.activeAuthTab = tab;
    this.isAuthOpen = true;
  }

  closeAuthModal() {
    this.isAuthOpen = false;
    this.showLoginPassword = false;
    this.showRegisterPassword = false;
  }

  switchTab(tab: 'login' | 'register') {
    this.activeAuthTab = tab;
    this.showLoginPassword = false;
    this.showRegisterPassword = false;
  }

  toggleLoginPassword() {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPassword() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.isAuthOpen) this.closeAuthModal();
  }


  whishlist() {
    this.router.navigate(["/whishlist"]);
  }
}
