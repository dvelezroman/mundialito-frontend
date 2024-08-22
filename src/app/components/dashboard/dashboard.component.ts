import {Component, OnInit} from '@angular/core';
import {PlayerCardsComponent} from "../player-cards/player-cards.component";
import {TeamService} from "../../services/team.service";
import {CommonModule, NgForOf, NgOptimizedImage} from "@angular/common";
import { PersonService } from '../../services/person.service';
import { FormsModule } from '@angular/forms';
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {S3Service} from "../../services/s3.service";

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

  showToast: boolean = false;
  toastMessage: string = '';
  teams = [] as any[];

  selectedTeamId: number | null = null;
  selectedTeamData: any = null;
  isModalOpen = false;
  personData = {
    firstname: '',
    personalId: '',
    lastname: '',
    birthdate: '',
    profilePhoto: null as File | null,
    teamId: null as number | null,
    type: 'PLAYER' as 'MANAGER' | 'PLAYER',
  };
  types = [
    { value: 'PLAYER', label: 'Player' },
    { value: 'MANAGER', label: 'Manager' }
  ];
  previewImageUrl: string | ArrayBuffer | null = null;

  constructor(
    private s3Service: S3Service,
    private teamService: TeamService,
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
    this.selectedTeamId = +target.value;
  
    if (this.selectedTeamId) {
      this.teamService.getTeam(this.selectedTeamId).subscribe({
        next: (data) => {
          this.selectedTeamData = data;
        },
        error: (error) => {
          console.error('Error al cargar información del equipo', error);
        }
      });
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal(fileInput?: HTMLInputElement) {
    this.isModalOpen = false;
    this.previewImageUrl = null;
    this.personData.profilePhoto = null;
    this.personData.firstname = '';
    this.personData.lastname = '';
    this.personData.personalId = '';
    this.personData.birthdate = '';
    this.selectedTeamId = null;

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
              console.log('Success: creating person');
              this.isModalOpen = false;
              this.router.navigate(['/dashboard']);
            },
            error: (error) => {
              console.error('Error creating person', error);
            }
          });
        },
        error: (err) => {
          console.error('Upload failed:', err);
          // Handle upload failure (e.g., show an error message)
        }
      });
    }
  }
  cardsPlayers() {
    if (this.selectedTeamId !== null) {
      this.router.navigate(['/player-cards', this.selectedTeamId]);
    } else {
      console.error('No team selected');
    }
  }
  howSuccessToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000); 
  }
  closeToast() {
    this.showToast = false;
  }
}
