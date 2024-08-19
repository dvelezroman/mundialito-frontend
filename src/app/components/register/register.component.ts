import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from "../../services/user.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  user = {
    email: '',
    password: '',
    isAdmin: false
  };

  constructor(private userService: UserService, private router: Router) {}

  register() {
    this.userService.register(this.user).subscribe({
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
