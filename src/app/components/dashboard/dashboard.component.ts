import {Component, OnInit} from '@angular/core';
import {PlayerCardsComponent} from "../player-cards/player-cards.component";
import {TeamService} from "../../services/team.service";
import {CommonModule, NgForOf, NgOptimizedImage} from "@angular/common";
import { PersonService } from '../../services/person.service';
import { FormsModule } from '@angular/forms';
import {Router} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    PlayerCardsComponent,
    NgForOf,
    FormsModule,
    CommonModule,
    NgOptimizedImage
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  teams = [] as any[];
  selectedTeamId: string | null = null;

  isModalOpen = false;
  personData = {
    firstName: '',
    lastName: '',
    personalId: '',
    birthdate: '',
    profilePhoto: undefined,
    type: 'PLAYER' as 'MANAGER' | 'PLAYER',
  };
  types = [
    { value: 'PLAYER', label: 'Player' },
    { value: 'MANAGER', label: 'Manager' }
  ];
  previewImageUrl: string | ArrayBuffer | null = null;

  constructor(private teamService: TeamService,
              private personService: PersonService,
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

  onTeamChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedTeamId = target.value;
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal(fileInput?: HTMLInputElement) {
    this.isModalOpen = false;
    this.previewImageUrl = null;
    this.personData.profilePhoto = undefined;

    this.personData.firstName = '';
    this.personData.lastName = '';
    this.personData.personalId = '';
    this.personData.birthdate = '';

    if (fileInput) {
      fileInput.value = '';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.personData.profilePhoto = file;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImageUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedImage() {
    this.previewImageUrl = null;
    this.personData.profilePhoto = undefined;
  }


  submitForm() {
    if (this.selectedTeamId === null) {
      console.error('No se ha seleccionado un equipo.');
      return;
    }

    const formData = {
      firstname: this.personData.firstName,
      lastname: this.personData.lastName,
      birthdate: this.personData.birthdate,
      teamId: +this.selectedTeamId,
      type: this.personData.type,
      personalId: this.personData.personalId,
      profilePhoto: this.personData.profilePhoto,
    };

    // Handle file upload separately if needed
    if (this.personData.profilePhoto) {
      // Convert file to base64 or handle upload in a different way
      const reader = new FileReader();
      reader.onload = () => {
        const base64ProfilePhoto = reader.result as string;
        this.personService.createPerson({
          ...formData,
          profilePhoto: base64ProfilePhoto
        }).subscribe({
          next: () => this.router.navigate(['/home']),
          error: (error) => {
            console.error('Error creating person', error);
            // Display user-friendly error message
          }
        });
      };
      reader.readAsDataURL(this.personData.profilePhoto);
    } else {
      this.personService.createPerson(formData).subscribe({
        next: () => this.router.navigate(['/home']),
        error: (error) => {
          console.error('Error creating person', error);
          // Display user-friendly error message
        }
      });
    }
  }

}
