import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isCategoryOpen = false;
  isMenuOpen = false;
  lastScrollTop = 0;
  toggleCategory() {
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


}
