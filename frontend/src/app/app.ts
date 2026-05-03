import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html'
})
export class App {

  showLayout = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showLayout = event.urlAfterRedirects !== '/login';
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  getRole() {
  return localStorage.getItem('role');
}
}
