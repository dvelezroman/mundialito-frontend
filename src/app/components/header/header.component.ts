import {Component, OnInit} from '@angular/core';
import {Router, RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;

  constructor(private router: Router,
              private userService: UserService
  ) {}

  ngOnInit() {
    
    this.userService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
    
    this.checkLoginStatus();

  }

  checkLoginStatus() {
    const token = this.userService['getToken']();
    this.isLoggedIn = !!token;
  }

  onRegister() {
    this.router.navigate(['/register']); // Adjust the route as needed
  }

  onLogin() {
    this.router.navigate(['/login']); // Adjust the route as needed
  }

  onLogout() {
    this.userService.logout(); // Llamamos al método logout del UserService
    this.router.navigate(['/home']);
  }
}
