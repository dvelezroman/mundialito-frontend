import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {UserService} from "../services/user.service";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import { CommonModule } from '@angular/common';

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
      console.log('hola')
      return;
    }
    this.userService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('User logged in successfully', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error logging in', error);
      }
    });
  }
}
