import {Component, OnInit} from '@angular/core';
import {PlayerCardsComponent} from "../player-cards/player-cards.component";
import {TeamService} from "../../services/team.service";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    PlayerCardsComponent,
    NgForOf
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  teams = [] as any[];
  selectedTeamId: number | null = null;

  constructor(private teamService: TeamService) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.teamService.getTeams().subscribe({
      next: (data) => {
        this.teams = data;
      },
      error: (error) => {
        console.error('Error loading teams', error);
      }
    });
  }

  onTeamChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedTeamId = parseInt(target.value, 10);
  }
}
