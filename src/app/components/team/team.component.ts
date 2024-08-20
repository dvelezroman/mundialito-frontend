import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {TeamService} from "../../services/team.service";
import {Router} from "@angular/router";
import {PersonService} from "../../services/person.service";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent implements OnInit {
  team = {
    name: '',
    logoImage: '',
    country: '',
    city: '',
    managerId: null as number | null
  };

  people = [] as any[];

  constructor(
    private teamService: TeamService,
    private personService: PersonService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPeople();
  }

  loadPeople() {
    this.personService.getPeople().subscribe({
      next: (data) => {
        this.people = data;
      },
      error: (error) => {
        console.error('Error loading people', error);
      }
    });
  }

  onSubmit() {
    this.teamService.createTeam(this.team).subscribe({
      next: () => {
        this.router.navigate(['/home']); // Adjust the route as needed
      },
      error: (error) => {
        console.error('Error creating team', error);
      }
    });
  }
}
