import {Component, Input, OnInit} from '@angular/core';
import {PersonService} from "../../services/person.service";
import {Router} from "@angular/router";
import {DatePipe, NgForOf, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-player-cards',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgForOf,
    DatePipe
  ],
  templateUrl: './player-cards.component.html',
  styleUrl: './player-cards.component.scss'
})
export class PlayerCardsComponent implements OnInit {
  @Input() teamId: number | null = null;
  players = [] as any[];

  constructor(private peopleService: PersonService, private router: Router) {}

  ngOnInit() {
    if (this.teamId !== null) {
      this.loadPlayers();
    }
  }

  loadPlayers() {
    if (this.teamId) {
      this.peopleService.getPlayersByTeam(this.teamId).subscribe({
        next: (data) => {
          this.players = data;
        },
        error: (error) => {
          console.error('Error loading players', error);
        }
      });
    }
  }
}
