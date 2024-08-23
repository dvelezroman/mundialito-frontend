import {Component, OnInit} from '@angular/core';
import {Router, RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import { UserService } from '../../services/user.service';
import {Store} from "@ngrx/store";

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
  isAdmin: boolean = false;

  constructor(private router: Router,
              private userService: UserService,
              private store: Store,
  ) {
  }

  ngOnInit() {
    this.userService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
    this.userService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    })

    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const token = this.userService.getToken();
    this.userService.refreshLogin().subscribe((response: any) => {
      this.isAdmin = response.isAdmin;
    })
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
