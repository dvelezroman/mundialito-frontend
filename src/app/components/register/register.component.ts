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
  registerForm: FormGroup;
  constructor(private userService: UserService, 
              private router: Router,
              private formBuilder: FormBuilder) {
                
                this.registerForm = this.formBuilder.group({
                  email: ['', [Validators.required, Validators.email]],
                  password: ['', [Validators.required, Validators.minLength(6)]],
                  isAdmin: [false]
                });
              }

              register() {
                if (this.registerForm.invalid) {
                  this.registerForm.markAllAsTouched(); 
                  return;
                }
              
                this.userService.register(this.registerForm.value).subscribe({
                  next: (response) => {
                    console.log('User registered successfully', response);
                    this.router.navigate(['/']);
                  },
                  error: (error) => {
                    console.error('Error registering user', error);
                  }
                });
              }
}
