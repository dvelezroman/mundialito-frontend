import { Routes } from '@angular/router';
import {RegisterComponent} from "./components/register/register.component";
import {LoginComponent} from "./components/login/login.component";
import {HomeComponent} from "./components/home/home.component";
import {AuthGuard} from "./components/auth/auth.guard";
import {PersonComponent} from "./components/person/person.component";
import {TeamComponent} from "./components/team/team.component";
import {PlayerCardsComponent} from "./components/player-cards/player-cards.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import { ReportesComponent } from './pages/reportes/reportes.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'people', component: PersonComponent, canActivate: [AuthGuard] },
  { path: 'teams', component: TeamComponent, canActivate: [AuthGuard] },
  { path: 'player-cards/:teamId', component: PlayerCardsComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' }, // Handle unknown routes
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
