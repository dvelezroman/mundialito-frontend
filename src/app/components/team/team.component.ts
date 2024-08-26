import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {TeamService} from "../../services/team.service";
import {Router} from "@angular/router";
import {PersonService} from "../../services/person.service";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {environment} from "../../../environments/environment";
import {S3Service} from "../../services/s3.service";
import {countries} from "./countries";

export interface Team {
  name: string;
  logoImage?: File | null,
  receiptImage?: File | null,
  country: string;
  city: string;
  category: 'INFANTO' | 'PRE' | 'JUVENIL';
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
  toastMessage: string = '';
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;
  countriesList = countries;

  team: Team = {
    name: '',
    country: 'Ecuador',
    city: '',
    logoImage: null,
    receiptImage: null,
    category: 'INFANTO',
  };

  people = [] as any[];
  previewLogoUrl: string | ArrayBuffer | null = null;
  previewReceiptUrl: string | ArrayBuffer | null = null;
  uploadedReceiptImage: string | null = null;

  constructor(
    private s3Service: S3Service,
    private teamService: TeamService,
    private personService: PersonService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPeople();
  }

  categories = ['INFANTO', 'PRE', 'JUVENIL'];

  get cities() {
    return this.countriesList[this.team.country] || [];
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

  onReceiptSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.team.receiptImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewReceiptUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
    this.previewLogoUrl = null;
    this.team.logoImage = null;
  }

  removeReceipt() {
    this.previewReceiptUrl = null;
    this.team.receiptImage = null;
  }



  onSubmit() {
    if (this.team.receiptImage) {
      const bucketName = environment.s3BucketName; // Ensure this is defined in your environment
      const key = `receipts/${this.team.receiptImage.name}`;

      this.s3Service.uploadFile(this.team.receiptImage, bucketName, key).subscribe({
        next: () => {
          const fileUrl = `https://${bucketName}.s3.${environment.aws_region}.amazonaws.com/${key}`;
          this.uploadedReceiptImage = fileUrl;
        },
        error: (err) => {
          console.error('Upload Receipt failed:', err);
          // Handle upload failure (e.g., show an error message)
        }
      });
    }
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
            logoImage: fileUrl,
            receiptImage: this.uploadedReceiptImage,
            category: this.team.category,
          }
          this.teamService.createTeam(formData).subscribe({
            next: () => {
              this.router.navigate(['/dashboard']);

            },
            error: (error) => {
              console.error('Error creating team', error);
            }
          });
        },
        error: (err) => {
          console.error('Upload Logo failed:', err);
          // Handle upload failure (e.g., show an error message)
        }
      });
    } else {
      this.teamService.createTeam(this.team).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error creating team', error);
        }
      });
    }
  }



  onCancel() {
    this.router.navigate(['/dashboard']);
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
