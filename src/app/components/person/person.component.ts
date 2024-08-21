import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { PersonService } from "../../services/person.service";
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {TeamService} from "../../services/team.service";

@Component({
  selector: 'app-person',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
  ],
  templateUrl: './person.component.html',
  styleUrl: './person.component.scss'
})
export class PersonComponent {
  person = {
    firstname: '',
    personalId: '',
    lastname: '',
    birthdate: '',
    profilePhoto: null as File | null,
    teamId: null as number | null,
    type: 'PLAYER' as 'MANAGER' | 'PLAYER',
  };

  teams = [] as any[];

  types = [
    { value: 'PLAYER', label: 'Player' },
    { value: 'MANAGER', label: 'Manager' }
  ];

  constructor(
    private personService: PersonService,
    private teamService: TeamService,
    private router: Router,
  ) {}

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

  onSubmit() {
    const formData = new FormData();
    formData.append('firstname', this.person.firstname);
    formData.append('lastname', this.person.lastname);
    formData.append('birthdate', this.person.birthdate);
    formData.append('teamId', this.person.teamId ? this.person.teamId.toString() : '');
    formData.append('type', this.person.type);

    if (this.person.profilePhoto) {
      formData.append('profilePhoto', this.person.profilePhoto);
    }

    this.personService.createPerson(formData).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error creating person', error);
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.person.profilePhoto = input.files[0];
    }
  }
}
