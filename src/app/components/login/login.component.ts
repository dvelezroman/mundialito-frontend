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
  passwordVisible: boolean = false;
  passwordHasValue: boolean = false;
  toastMessage: string = '';
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;


  constructor(private userService: UserService,
              private router: Router,
              private formBuilder: FormBuilder) {

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  onPasswordInput(event: any) {
    this.passwordHasValue = event.target.value.length > 0;
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.howErrorToast('Completa todos los campos'); 
      return;
    }
  
    this.userService.login(this.loginForm.value).subscribe({
      next: (response) => {
        const token = response.token; 
        localStorage.setItem('authToken', token);
        this.router.navigate(['/dashboard']); 
      },
      error: (error) => {
        if (error.status === 401) {
          this.howErrorToast('Credenciales incorrectas');
        } else {
          this.howErrorToast('Hubo un error al iniciar sesión');
        }
        console.log('Error logging in', error);
      }
    });
  }
  

  howSuccessToast(message: string) {
    this.toastMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 1800); 
  }

  howErrorToast(message: string) {
    this.toastMessage = message;
    this.showErrorToast = true;
    setTimeout(() => {
      this.showErrorToast = false;
    }, 1800);
  }

}
