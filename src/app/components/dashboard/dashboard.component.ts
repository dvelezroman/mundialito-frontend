import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {PlayerCardsComponent} from "../player-cards/player-cards.component";
import {TeamService} from "../../services/team.service";
import {CommonModule, NgForOf, NgOptimizedImage} from "@angular/common";
import { PersonService } from '../../services/person.service';
import { FormsModule } from '@angular/forms';
import {Router, RouterModule} from "@angular/router";
import {environment} from "../../../environments/environment";
import {S3Service} from "../../services/s3.service";
import {countries} from "../team/countries";
import {resizeImage} from "../../utils/file.util";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    PlayerCardsComponent,
    NgForOf,
    FormsModule,
    CommonModule,
    NgOptimizedImage,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  @ViewChild('teamCard', { static: false }) teamCard!: ElementRef;

    protected  readonly  countriesList = countries;
    toastMessage: string = '';
    showSuccessToast: boolean = false;
    showErrorToast: boolean = false;
    isOptionsModalOpen = false;
    teams = [] as any[];

    selectedTeamId: number | null = null;
    selectedTeamData: any = null;
    isModalOpen = false;
    personData = {
      firstname: '',
      personalId: '',
      lastname: '',
      birthdate: '',
    country: null as string | null,
      profilePhoto: null as File | null,
      teamId: null as number | null,
      type: 'PLAYER' as 'MANAGER' | 'PLAYER',
    };
    types = [
      { value: 'PLAYER', label: 'Jugador' },
      { value: 'MANAGER', label: 'Entrenador' }
    ];
    previewImageUrl: string | ArrayBuffer | null = null;

  constructor(
    private s3Service: S3Service,
    private teamService: TeamService,
    private personService: PersonService,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.loadTeams();
  }

  openOptionsModal() {
    this.isOptionsModalOpen = true;
  }

  closeOptionsModal() {
    this.isOptionsModalOpen = false;
  }


  loadTeams() {
    this.teamService.getTeams().subscribe({
      next: (data) => {
        this.teams = data;
      },
      error: (error) => {
        if (error.status === 401) {
          this.howErrorToast('Su sesión ha expirado.')
          this.router.navigate(['login']);
        }
        console.error('Error loading teams', error);
        this.howErrorToast('Error de carga.')
      }
    });
  }

  onTeamChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedTeamId = +target.value;

    if (this.selectedTeamId) {
      this.teamService.getTeam(this.selectedTeamId).subscribe({
        next: (data) => {
          this.selectedTeamData = data;
        },
        error: (error) => {
          console.error('Error al cargar información del equipo', error);
          this.howErrorToast('Error al cargar información del equipo.')
        }
      });
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  resetForm() {
    this.previewImageUrl = null;
    this.personData.profilePhoto = null;
    this.personData.firstname = '';
    this.personData.lastname = '';
    this.personData.personalId = '';
    this.personData.birthdate = '';
    this.personData.country = null;
  }

  closeModal(fileInput?: HTMLInputElement) {
    this.resetForm();
    this.isModalOpen = false;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      resizeImage(file, 200, 200).then((resizedFile) => {
        this.personData.profilePhoto = resizedFile;
        const reader = new FileReader();
        reader.onload = () => {
          this.previewImageUrl = reader.result;
        };
        reader.readAsDataURL(resizedFile);
      }).catch((error: Error) => {
        console.error('Error resizing image:', error);
      });
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
    this.personData.profilePhoto = null;
  }


  submitForm() {

    if (this.selectedTeamId === null) {
      console.error('No se ha seleccionado un equipo.');
      this.howErrorToast('No se ha seleccionado un equipo.')
      return;
    }

    const formData = {
      firstname: this.personData.firstname,
      lastname: this.personData.lastname,
      birthdate: new Date(this.personData.birthdate),
      teamId: +this.selectedTeamId,
      type: this.personData.type,
      personalId: this.personData.personalId,
      profilePhoto: null as null | string,
      country: this.personData.country,
    }

    if (this.personData.profilePhoto) {
      const bucketName = environment.s3BucketName; // Ensure this is defined in your environment
      const key = `players/${this.personData.profilePhoto.name}`;

      this.s3Service.uploadFile(this.personData.profilePhoto, bucketName, key).subscribe({
        next: () => {
          const fileUrl = `https://${bucketName}.s3.${environment.aws_region}.amazonaws.com/${key}`;
          formData.profilePhoto = fileUrl;
          this.personService.createPerson(formData).subscribe({
            next: () => {
              this.howSuccessToast('Jugador agregado al equipo!!.');
              this.resetForm();
              this.closeModal()
              this.router.navigate(['/dashboard']);
            },
            error: (error) => {
              console.error('Error creating person', error);
              this.howErrorToast('No se puedo crear al jugador.')
            }
          });
        },
        error: (err) => {
          console.error('Upload failed:', err);
          this.howErrorToast('Hubo un error al crear al jugador.');
          // Handle upload failure (e.g., show an error message)
        }
      });
    }
  }
  cardsPlayers() {
    if (this.selectedTeamId !== null) {
      this.router.navigate(['/player-cards', this.selectedTeamId]);
    } else {
      // console.error('No team selected');
      this.howErrorToast('No se ha seleccionado un equipo.');

    }
  }
  howSuccessToast(message: string) {
    this.toastMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 2000);
  }

  howErrorToast(message: string) {
    this.toastMessage = message;
    this.showErrorToast = true;
    setTimeout(() => {
      this.showErrorToast = false;
    }, 2000);
  }
}
