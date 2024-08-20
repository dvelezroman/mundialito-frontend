import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {UserService} from "../services/user.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  user = {
    email: '',
    password: ''
  };

  constructor(private userService: UserService, private router: Router) {}

  login() {
    this.userService.login(this.user).subscribe({
      next: (response) => {
        console.log('User logged in successfully', response);
        // Handle successful login (e.g., store token, redirect to dashboard)
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error logging in', error);
      }
    });
  }
}
