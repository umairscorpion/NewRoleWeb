import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl
} from '@angular/platform-browser';


declare const $: any;


@Component({
  selector: 'ng-nav',
  templateUrl: 'nav.template.html'
})
export class NavbarComponent implements OnInit {
  public menuItems: any[];
  appName: string = 'Appointmentor';
  active: string = 'settings';
  trustedProfileImageUrl: SafeUrl;

  constructor(
    private router: Router
  ) { }
  ngOnInit() {
    this.menuItems = this.router.config[1].children;
  }

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }

  isMac(): boolean {
    let bool = false;
    if (
      navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
      navigator.platform.toUpperCase().indexOf('IPAD') >= 0
    ) {
      bool = true;
    }
    return bool;
  }
}
