import {Component, OnInit} from '@angular/core';
import {PersonService} from "../../services/person.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CommonModule, DatePipe, NgForOf, NgOptimizedImage} from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { environment } from '../../../environments/environment';
import { S3Service } from '../../services/s3.service';

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
  selectedFile: File | null = null;

  constructor(private peopleService: PersonService,
              private teamService: TeamService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private s3Service: S3Service) {

    this.editPlayerForm = this.fb.group({
      personalId: [{ value: '', disabled: true }],
      firstname: [''],
      lastname: [''],
      birthdate: [''],
      country: [{ value: '', disabled: true }],
      type: [{ value: '', disabled: true }],
      teamId: this.teamId,
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

  convertToLocalDate(date: string): string {
    return date.split('T')[0];
  }

  navigateBack(): void {
    window.history.back();
  }

  loadTeamInfo() {
    if (this.teamId !== null) {
      this.teamService.getTeam(this.teamId).subscribe({
        next: (data) => {
          this.team = data;
        },
        error: (error) => {
          console.error('Error al cargar la información del equipo', error);
          if (error.status === 401) {
            this.howErrorToast('Su sesión ha expirado.')
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


// METODO PARA ELIMINAR JUGADOR //

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
          this.loadTeamInfo();
          this.loadPlayers();
          this.closeEditModal();
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

  // METODO PARA EDITAR DATOS DEL JUGADOR //

  openEditModal(player: any): void {
    this.playerToEdit = player;
    this.editPlayerForm.patchValue({
      personalId: player.personalId,
      firstname: player.firstname,
      lastname: player.lastname,
      birthdate: player.birthdate ? new Date(player.birthdate).toISOString().split('T')[0] : '',
      country: player.country,
      type: player.type,
      profilePhoto: player.profilePhoto,
    });
    this.showEditModal = true;
  }


  closeEditModal() {
    this.showEditModal = false;
    this.playerToEdit = null;
  }


  submitEdit(): void {
    if (this.playerToEdit && this.editPlayerForm.valid) {
      const formData = {
        firstname: this.editPlayerForm.get('firstname')?.value,
        lastname: this.editPlayerForm.get('lastname')?.value,
        birthdate: new Date(this.editPlayerForm.get('birthdate')?.value),
        teamId: this.playerToEdit.teamId,
        type: this.playerToEdit.type, 
        personalId: this.editPlayerForm.get('personalId')?.value,
        profilePhoto: this.playerToEdit.profilePhoto, 
        country: this.playerToEdit.country 
      };
  
      if (this.selectedFile) {
        const bucketName = environment.s3BucketName;
        const key = `players/${this.selectedFile.name}`;
  
        this.s3Service.uploadFile(this.selectedFile, bucketName, key).subscribe({
          next: () => {
            const fileUrl = `https://${bucketName}.s3.${environment.aws_region}.amazonaws.com/${key}`;
            formData.profilePhoto = fileUrl; 
  
            this.peopleService.updatePerson(this.playerToEdit.id, formData).subscribe({
              next: () => {
                this.howSuccessToast('Jugador actualizado exitosamente');
                this.closeEditModal();
                this.loadPlayers(); 
              },
              error: (error) => {
                this.howErrorToast('No se pudo actualizar al jugador.');
                console.error('Error al actualizar al jugador', error);
              }
            });
          },
          error: (err) => {
            console.error('Error al subir la imagen:', err);
            this.howErrorToast('Error al actualizar la imagen del jugador.');
          }
        });
      } else {

        this.peopleService.updatePerson(this.playerToEdit.id, formData).subscribe({
          next: () => {
            this.howSuccessToast('Jugador actualizado exitosamente');
            this.closeEditModal();
            this.loadPlayers();
          },
          error: (error) => {
            this.howErrorToast('No se pudo actualizar al jugador.');
            console.error('Error al actualizar al jugador', error);
          }
        });
      }
    } else {
      this.howErrorToast('Formulario no válido. Por favor, completa los campos correctamente.');
    }
  }


  
// TOAST DE AVISOS //

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


  // METODO PARA IMPRIMIR TABLA DE JUGADORES //

  printPlayers() {
    const teamInfoElement = document.querySelector('.team-info');
    const playersContainerElement = document.querySelector('.players-container');

    if (teamInfoElement && playersContainerElement) {
      const printContents = teamInfoElement.outerHTML + playersContainerElement.outerHTML;

      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow?.document.write(`
        <html>
          <head>
            <title>Imprimir Equipo</title>
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
                .team-logo {
                  max-width: 100px;
                  height: auto;
                  object-fit: contain;
                  margin-left: 20px;
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
