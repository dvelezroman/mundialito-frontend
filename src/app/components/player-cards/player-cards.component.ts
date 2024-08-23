import {Component, Input, OnInit} from '@angular/core';
import {PersonService} from "../../services/person.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CommonModule, DatePipe, NgForOf, NgOptimizedImage} from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-player-cards',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgForOf,
    DatePipe,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './player-cards.component.html',
  styleUrl: './player-cards.component.scss'
})
export class PlayerCardsComponent implements OnInit {

  teamId: number | null = null;
  toastMessage: string = '';
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;

  players = [] as any[];

  showDeleteConfirmToast: boolean = false;
  playerToDelete: number | null = null;

  showEditModal: boolean = false;
  playerToEdit: any = null;
  editPlayerForm: FormGroup;

  constructor(private peopleService: PersonService, 
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder) {

    this.editPlayerForm = this.fb.group({
         firstname: [''],
         lastname: [''],
         personalId: [''],
         birthdate: [''],
         type: ['']
       });
     }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('teamId');
      this.teamId = id ? +id : null; 
      this.loadPlayers(); 
      if (this.playerToEdit) {
        this.setPlayerToEdit(this.playerToEdit.id);
      }
    });
  }
  

  loadPlayers() {
    if (this.teamId !== null) {
      this.peopleService.getPlayersByTeam(this.teamId).subscribe({
        next: (data) => {
          this.players = data; 
          if (this.playerToEdit) {
            this.setPlayerToEdit(this.playerToEdit.id);
          }
        },
        error: (error) => {
          console.error('Error loading players', error); 
        }
      });
    }
  }

  setPlayerToEdit(playerId: number) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      this.playerToEdit = player;
      this.editPlayerForm.patchValue({
        firstname: player.firstname,
        lastname: player.lastname,
        personalId: player.personalId,
        birthdate: new Date(player.birthdate).toISOString().split('T')[0], 
        type: player.type
      });
      this.showEditModal = true;
    }
  }
  


  confirmDeletePlayer(playerId: number) {
    this.playerToDelete = playerId;
    this.showDeleteConfirmToast = true; 
  }


  confirmDeletion() {
    if (this.playerToDelete !== null) {
        this.deletePlayer(this.playerToDelete); 
    }
}


   cancelDelete() {
    this.showDeleteConfirmToast = false; 
    this.playerToDelete = null; 
  }


  deletePlayer(playerId?: number) {
    const idToDelete = playerId || this.playerToDelete;
    if (idToDelete !== null) {
      this.peopleService.deletePerson(idToDelete).subscribe({
        next: () => {
          this.players = this.players.filter(player => player.id !== idToDelete);
          this.showDeleteConfirmToast = false; 
          this.playerToDelete = null;
          this.howSuccessToast('Jugador eliminado exitosamente');
          console.log('Jugador eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar el jugador', error);
          this.howErrorToast('Hubo un error al momento de eliminar al jugador');
          this.showDeleteConfirmToast = false;
        }
      });
    }
  }

  

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }


  openEditModal(player: any) {
    if (this.showDeleteConfirmToast) {
      return; 
    }
    this.playerToEdit = player;
    this.editPlayerForm.patchValue({
      firstname: player.firstname,
      lastname: player.lastname,
      personalId: player.personalId,
      birthdate: new Date(player.birthdate).toISOString().split('T')[0], // Formato de fecha
      type: player.type
    });
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.playerToEdit = null;
  }

  submitEdit() {
    if (this.playerToEdit) {
      const formData = new FormData();
      formData.append('firstname', this.editPlayerForm.get('firstname')?.value);
      formData.append('lastname', this.editPlayerForm.get('lastname')?.value);
      formData.append('personalId', this.editPlayerForm.get('personalId')?.value);
      formData.append('birthdate', this.editPlayerForm.get('birthdate')?.value);
      formData.append('type', this.editPlayerForm.get('type')?.value);

      this.peopleService.updatePerson(this.playerToEdit.id, formData).subscribe({
        next: () => {
          this.howSuccessToast('Los datos se han actualizado');
          this.closeEditModal();
          this.loadPlayers();
        },
        error: (error) => {
          console.error('Error al actualizar el jugador', error);
          this.howErrorToast('Hubo un error al momento de actualizar');
        }
      });
    }
  }

  howSuccessToast(message: string) {
    this.toastMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 2500); 
  }
  
  howErrorToast(message: string) {
    this.toastMessage = message;
    this.showErrorToast = true;
    setTimeout(() => {
      this.showErrorToast = false;
    }, 2500);
  }
}
