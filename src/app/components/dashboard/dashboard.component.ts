import {Component, OnInit} from '@angular/core';
import {PlayerCardsComponent} from "../player-cards/player-cards.component";
import {TeamService} from "../../services/team.service";
import {CommonModule, NgForOf} from "@angular/common";
import { PersonService } from '../../services/person.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    PlayerCardsComponent,
    NgForOf,
    FormsModule,
    CommonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  teams = [] as any[];
  selectedTeamId: number | null = null;

  isModalOpen = false; 
  personData = {
    firstName: '',
    lastName: '',
    cedula: '',
    age: null as number | null,
    photo: null
  };
  previewImageUrl: string | ArrayBuffer | null = null;

  constructor(private teamService: TeamService,
              private personService: PersonService
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
    this.selectedTeamId = parseInt(target.value, 10);
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal(fileInput?: HTMLInputElement) {
    this.isModalOpen = false;
    this.previewImageUrl = null;
    this.personData.photo = null; 

    this.personData.firstName = '';
    this.personData.lastName = '';
    this.personData.cedula = '';
    this.personData.age = null;
  
    if (fileInput) {
      fileInput.value = ''; 
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.personData.photo = file;

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
    this.personData.photo = null; 
  }


  submitForm() {
    if (this.selectedTeamId === null) {
      console.error('No se ha seleccionado un equipo.');
      return;
    }

    const formData = new FormData();
    formData.append('firstName', this.personData.firstName);
    formData.append('lastName', this.personData.lastName);
    formData.append('cedula', this.personData.cedula);
    formData.append('age', (this.personData.age ?? 0).toString());
    formData.append('teamId', this.selectedTeamId.toString()); 

    if (this.personData.photo) {
      formData.append('photo', this.personData.photo);
    }

    this.personService.createPerson(formData).subscribe({
      next: (response) => {
        console.log('Jugador agregado exitosamente', response);
        this.closeModal();
      },
      error: (error) => {
        console.error('Error al agregar jugador', error);
      }
    });
  }

}
