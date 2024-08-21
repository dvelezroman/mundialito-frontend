import {Component, OnInit} from '@angular/core';
import {Router, RouterModule} from "@angular/router";
import {CommonModule, NgIf} from "@angular/common";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    this.isLoggedIn = !!token;
  }

  onRegister() {
    this.router.navigate(['/register']); // Adjust the route as needed
  }

  onLogin() {
    this.router.navigate(['/login']); // Adjust the route as needed
  }

  onLogout() {
    // Clear the token from localStorage
    localStorage.removeItem('authToken');

    // Redirect to login page or home
    this.router.navigate(['/home']); // Adjust the route as needed
  }
}
