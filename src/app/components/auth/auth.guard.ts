import { Injectable } from '@angular/core';
import * as jwt from 'jsonwebtoken';
import { CanActivate, Router } from '@angular/router';
import {UserService} from "../../services/user.service";


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';

    if (token) {
      try {
        const decodedToken: any = jwt.decode(token);
        console.log(decodedToken);
        if (decodedToken && decodedToken.isAdmin) {
          return true; // Token exists and user is admin
        } else {
          this.router.navigate(['/home']); // Redirect to home if not admin
          return false;
        }
      } catch (error) {
        this.router.navigate(['/home']); // Redirect if token decoding fails
        return false;
      }
    } else {
      this.router.navigate(['/home']); // Redirect to home if no token
      return false;
    }
  }
}
