import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  

  constructor(private userService: UserService, 
              private router: Router,
              private formBuilder: FormBuilder) {

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); 
      return;
    }
    this.userService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('User logged in successfully', response);
        // Handle successful login (e.g., store token, redirect to dashboard)
        const token = response.token; // Adjust according to your API response structure
        localStorage.setItem('authToken', token);
        this.router.navigate(['/dashboard']); // Redirect after login
      },
      error: (error) => {
        console.error('Error logging in', error);
      }
    });
  }
}
