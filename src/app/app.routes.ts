import { Routes } from '@angular/router';
import {RegisterComponent} from "./components/register/register.component";
import {LoginComponent} from "./login/login.component";
import {HomeComponent} from "./components/home/home.component";

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/home' } // Handle unknown routes
];
