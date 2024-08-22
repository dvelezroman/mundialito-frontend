import {Component, OnInit} from '@angular/core';
import {PlayerCardsComponent} from "../player-cards/player-cards.component";
import {TeamService} from "../../services/team.service";
import {CommonModule, NgForOf} from "@angular/common";
import { PersonService } from '../../services/person.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  selectedTeamData: any = null;

  isModalOpen = false; 
  personData = {
    firstName: '',
    lastName: '',
    cedula: '',
    birthdate: '', 
    photo: null,
    type: 'PLAYER'
  };
  previewImageUrl: string | ArrayBuffer | null = null;

  types = [
    { label: 'Jugador', value: 'PLAYER' },
    { label: 'Manager', value: 'MANAGER' }
  ];

  

  constructor(private teamService: TeamService,
              private personService: PersonService,
              private router: Router
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
    this.personData.birthdate = '';
    this.personData.type = 'PLAYER';
  
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

  closeTeamCard() {
    this.selectedTeamData = null; 
    this.selectedTeamId = null; 
    const selectElement = document.getElementById('team') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = ''; 
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
  

    const personData = {
      firstname: this.personData.firstName,
      lastname: this.personData.lastName,
      personalId: this.personData.cedula,
      birthdate: this.personData.birthdate,
      teamId: this.selectedTeamId,
      type: this.personData.type,  
      profilePhoto: null  
    };
  

    this.personService.createPerson(personData).subscribe({
      next: (response) => {
        console.log('Jugador agregado exitosamente', response);
        this.closeModal();
      },
      error: (error) => {
        console.error('Error al agregar jugador', error);
      }
    });
  }

cardsPlayers() {
  if (this.selectedTeamId !== null) {
    this.router.navigate(['/player-cards', this.selectedTeamId]);
  } else {
    console.error('No team selected');
  }
}
  

}
