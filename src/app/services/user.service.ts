import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {environment} from "../../environments/environment";
import {Store} from "@ngrx/store";
import {setAdminStatus, setLoggedInStatus} from "../store/user.action";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  isAdmin$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  public getToken(): string | null {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  public refreshLogin() {
    return this.http.get(`${this.apiUrl}/refresh/login`, { headers: this.getHeaders() })
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user, { headers: this.getHeaders() });
  }

  login(credentials: any): Observable<{ token: string, isAdmin: boolean }> {
    return this.http.post<{ token: string, isAdmin: boolean }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            localStorage.setItem('authToken', response.token);
            this.isLoggedInSubject.next(!!response.token);
            this.isAdmin$.next(response.isAdmin);
            this.store.dispatch(setAdminStatus({ isAdmin: response.isAdmin }));
            this.store.dispatch(setLoggedInStatus({ isLoggedIn: !!response.token }));
          }
        })
      );
  }

  logout(): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
      this.isLoggedInSubject.next(false);
      this.isAdmin$.next(false);
      this.store.dispatch(setLoggedInStatus({ isLoggedIn: false }));
      this.store.dispatch(setAdminStatus({ isAdmin: false }));
    }
  }

  update(id: number, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

}
