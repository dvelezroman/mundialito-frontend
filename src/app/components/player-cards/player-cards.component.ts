import {Component, OnInit} from '@angular/core';
import {PersonService} from "../../services/person.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CommonModule, DatePipe, NgForOf, NgOptimizedImage} from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TeamService } from '../../services/team.service';

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
  team: any = {};
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
              private teamService: TeamService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder) {

    this.editPlayerForm = this.fb.group({
       firstname: [''],
       lastname: [''],
       personalId: [''],
       birthdate: [''],
       type: [''],
        teamId: null as number | null,
     });
   }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('teamId');
      this.teamId = id ? +id : null;

      this.loadPlayers();
      this.loadTeamInfo();
    });
  }

  loadTeamInfo() {
    if (this.teamId !== null) {
      this.teamService.getTeam(this.teamId).subscribe({
        next: (data) => {
          this.team = data;
          // console.log('Team Data:', this.team);
        },
        error: (error) => {
          console.error('Error al cargar la información del equipo', error);
          if (error.status === 401) {
            this.howErrorToast('Su sesion ha expirado.')
            this.router.navigate(['login']);
          }
        }
      });
    }
  }

  loadPlayers() {
    if (this.teamId !== null) {
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
      const formData = {
        firstname: this.editPlayerForm.get('firstname')?.value,
        lastname: this.editPlayerForm.get('lastname')?.value,
        personalId: this.editPlayerForm.get('personalId')?.value,
        birthdate: new Date(this.editPlayerForm.get('birthdate')?.value),
        type: this.editPlayerForm.get('type')?.value,
        teamId: this.teamId,
      }

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

  printPlayers() {
    const teamInfoElement = document.querySelector('.team-info');
    const playersContainerElement = document.querySelector('.players-container');

    if (teamInfoElement && playersContainerElement) {
      const printContents = teamInfoElement.outerHTML + playersContainerElement.outerHTML;

      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow?.document.write(`
        <html>
          <head>
            <title>Imprimir Jugadores</title>
            <style>
              @media print {
                body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                }
                h2, h3 {
                  text-align: center;
                  color: #333;
                }
                .team-info {
                  margin-bottom: 20px;
                }
                .players-container {
                  width: 100%;
                  margin-top: 20px;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  padding: 5px;
                  border: 1px solid black;
                  text-align: left;
                  font-size: 12px;
                }
                th {
                  background-color: #f2f2f2;
                }
                .player-photo {
                  width: 50px;
                  height: auto;
                  object-fit: contain;
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
      console.error('Error: No se encontraron elementos para imprimir.');
    }
  }
}
