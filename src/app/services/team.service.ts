import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/teams`; // Adjust the API endpoint as needed

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Create a new team
  createTeam(team: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, team, { headers: this.getHeaders() });
  }

  // Update an existing team
  updateTeam(id: number, team: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, team, { headers: this.getHeaders() });
  }

  // Delete a team
  deleteTeam(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Get a list of teams
  getTeams(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { headers: this.getHeaders() });
  }

  // Get a specific team by ID
  getTeam(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
