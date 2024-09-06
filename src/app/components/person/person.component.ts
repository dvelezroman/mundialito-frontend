import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { PersonService } from "../../services/person.service";
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {TeamService} from "../../services/team.service";
import {environment} from "../../../environments/environment";
import {S3Service} from "../../services/s3.service";

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
    private s3Service: S3Service,
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
        if (error.status === 401) {
          this.router.navigate(['login']);
        }
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
      const bucketName = environment.s3BucketName; // Ensure this is defined in your environment
      const key = `players/${this.person.profilePhoto.name}`;

      this.s3Service.uploadFile(this.person.profilePhoto, bucketName, key).subscribe({
        next: (response) => {
          const fileUrl = `https://${bucketName}.s3.${environment.aws_region}.amazonaws.com/${key}`;
          formData.append('profilePhoto', fileUrl);
          this.personService.createPerson(formData).subscribe({
            next: () => {
              console.error('Success: creating person');
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

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.person.profilePhoto = input.files[0];
    }
  }
}
