import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from "../../services/user.service";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  passwordVisible: boolean = false;
  passwordHasValue: boolean = false;

  registerForm: FormGroup;

  toastMessage: string = '';
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;
  
  constructor(private userService: UserService, 
              private router: Router,
              private formBuilder: FormBuilder) {
                
                this.registerForm = this.formBuilder.group({
                  email: ['', [Validators.required, Validators.email]],
                  password: ['', [Validators.required, Validators.minLength(6)]],
                  isAdmin: [false]
                });
              }


  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  onPasswordInput(event: any) {
    this.passwordHasValue = event.target.value.length > 0;
  }

   register() {
     if (this.registerForm.invalid) {
        this.registerForm.markAllAsTouched(); 
       return;
      }
              
    this.userService.register(this.registerForm.value).subscribe({
     next: (response) => {
     this.howSuccessToast(' Registro exitoso.');
     this.router.navigate(['/']);
     },
    error: (error) => {
      this.howErrorToast('Hubo un error al momento de registrarse');
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
