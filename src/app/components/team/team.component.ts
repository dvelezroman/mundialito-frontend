import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {TeamService} from "../../services/team.service";
import {Router} from "@angular/router";
import {PersonService} from "../../services/person.service";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {environment} from "../../../environments/environment";
import {S3Service} from "../../services/s3.service";

export interface Team {
  name: string;
  logoImage?: File | null,
  country: string;
  city: string;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent implements OnInit {
  team: Team = {
    name: '',
    country: '',
    city: '',
    logoImage: null,
  };

  people = [] as any[];
  previewLogoUrl: string | ArrayBuffer | null = null;

  constructor(
    private s3Service: S3Service,
    private teamService: TeamService,
    private personService: PersonService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPeople();
  }

  loadPeople() {
    this.personService.getPeople().subscribe({
      next: (data) => {
        this.people = data;
      },
      error: (error) => {
        console.error('Error loading people', error);
      }
    });
  }


  onLogoSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.team.logoImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewLogoUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
    this.previewLogoUrl = null;
    this.team.logoImage = null;
  }


  onSubmit() {
    if (this.team.logoImage) {
      const bucketName = environment.s3BucketName; // Ensure this is defined in your environment
      const key = `teams/${this.team.logoImage.name}`;

      this.s3Service.uploadFile(this.team.logoImage, bucketName, key).subscribe({
        next: () => {
          const fileUrl = `https://${bucketName}.s3.${environment.aws_region}.amazonaws.com/${key}`;
          const formData = {
            name: this.team.name,
            country: this.team.country,
            city: this.team.city,
            logoImage: fileUrl
          }
          this.teamService.createTeam(formData).subscribe({
            next: () => {
              this.router.navigate(['/home']);
            },
            error: (error) => {
              console.error('Error creating team', error);
            }
          });
        },
        error: (err) => {
          console.error('Upload failed:', err);
          // Handle upload failure (e.g., show an error message)
        }
      });
    } else {
      this.teamService.createTeam(this.team).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error creating team', error);
        }
      });
    }
  }



  onCancel() {
    this.router.navigate(['/home']);
  }
}
