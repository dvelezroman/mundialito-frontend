import {Component, OnInit} from '@angular/core';
import {Router, RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import { UserService } from '../../services/user.service';
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {selectIsAdmin} from "../../store/user.selector";

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
  showLogoutModal = false; 
  menuOpen = false;

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

  isLinkActive(link: string): boolean {
    return this.router.url === link;
  }

  checkLoginStatus() {
    const token = this.userService.getToken();
    this.userService.refreshLogin().subscribe((response: any) => {
      this.isAdmin = response.isAdmin;
    })
    this.isLoggedIn = !!token;
  }

  onRegister() {
    this.router.navigate(['/register']); 
  }

  onLogin() {
    this.router.navigate(['/login']); 
  }

  onLogout() {
    this.userService.logout(); 
    this.router.navigate(['/home']);
  }

    openLogoutModal() {
      this.showLogoutModal = true;
    }
  

    closeLogoutModal() {
      this.showLogoutModal = false;
    }
  

    confirmLogout() {
      this.closeLogoutModal();
      this.userService.logout(); 
      this.router.navigate(['/home']);
    }

    
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    }
  
    closeMenu() {
      this.menuOpen = false;
    }
}
