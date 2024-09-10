import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  searchPerformed: boolean = false;
  showNoTeamsToast: boolean = false;
  teamSearchTerm: string = '';

  @ViewChild('printableTable', { static: false }) printableTable!: ElementRef;

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
      },
      error: (error) => {
        console.error('Error', error);
      }
    });
  }

  onCountryChange() {
    this.searchPerformed = true;
    this.filterTeams();
  }

  onCategoryChange() {
    this.searchPerformed = true;
    this.filterTeams();
  }

  onTeamSearch() {
    this.filterTeams();
  }

  filterTeams() {
    this.filteredTeams = this.teams
      .filter(team => this.selectedCountry ? team.country === this.selectedCountry : true)
      .filter(team => this.selectedCategory ? team.category === this.selectedCategory : true)
      .filter(team => this.teamSearchTerm ? team.name.toLowerCase().includes(this.teamSearchTerm.toLowerCase()) : true);
    if (this.filteredTeams.length === 0) {
      this.showNoTeamsToast = true;
      setTimeout(() => {
        this.showNoTeamsToast = false;
      }, 3000);
    }
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  viewTeamPlayers(teamId: number) {
    this.router.navigate(['/player-cards', teamId]);
  }

  printTable() {
    const tableElement = document.querySelector('.printable-table');


    if (tableElement) {
      const printContents = tableElement.outerHTML;


      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow?.document.write(`
        <html>
          <head>
            <title>Imprimir Reporte</title>
            <style>
              @media print {
                .no-print { display: none; }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  padding: 8px;
                  border: 1px solid black;
                  text-align: left;
                }
              }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.focus();
      printWindow?.print();
      printWindow?.close();
    } else {
      console.error("No se encontró el elemento de la tabla para imprimir");
    }
  }

}
