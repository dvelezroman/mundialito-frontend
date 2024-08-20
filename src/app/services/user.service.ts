import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
     tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
        }
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }),
      catchError((error) => {
        console.error('Error during login', error);
        return throwError(error);
      })
    );
  }

  update(id: number, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

   getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
