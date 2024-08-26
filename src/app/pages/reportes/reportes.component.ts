import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../services/team.service';
import { countries } from '../../components/team/countries';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent implements OnInit {

  teams: any[] = [];
  filteredTeams: any[] = [];
  countriesList = countries;
  selectedCountry: string = '';
  selectedCategory: string = '';
  categories = ['INFANTO', 'PRE', 'JUVENIL'];


  constructor(private teamService: TeamService,
              private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTeams();
  }
  loadTeams() {
    this.teamService.getTeams().subscribe({
      next: (data) => {
        this.teams = data;
        console.log('Teams cargados:', this.teams);
      },
      error: (error) => {
        console.error('Error', error);
      }
    });
  }

  onCountryChange() {
    this.filterTeams();
  }

  onCategoryChange() {
    this.filterTeams();
  }

  filterTeams() {
    this.filteredTeams = this.teams.filter(team => {
      return (this.selectedCountry === '' || team.country === this.selectedCountry) &&
             (this.selectedCategory === '' || team.category === this.selectedCategory);
    });
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
