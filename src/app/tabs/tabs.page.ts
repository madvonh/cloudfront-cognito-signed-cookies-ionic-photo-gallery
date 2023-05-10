import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {

  constructor(private auth:AuthService, private router:Router) {}

  logout() {
    this.auth.signOut().then(() =>{
      this.router.navigateByUrl('login');
    });
  }
}
