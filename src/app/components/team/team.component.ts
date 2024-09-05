import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {TeamService} from "../../services/team.service";
import {Router} from "@angular/router";
import {PersonService} from "../../services/person.service";
import {CommonModule, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
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
    CommonModule,
    NgOptimizedImage
  ],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent implements OnInit {
  toastMessage: string = '';
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;
  countriesList = countries;
  maxFileSize = 16000; // 15 KB in bytes

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

    // Check file size
    if (file.size > this.maxFileSize) {
      this.resizeImage(file, 200, 200).then(resizedFile => {
        this.handleFileUpload(resizedFile);
      }).catch(() => {
        alert('The image is too large and could not be resized.');
      });
    } else {
      this.handleFileUpload(file);
    }

    if (this.team.logoImage) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewLogoUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle file upload and set preview
  handleFileUpload(file: File) {
    this.team.logoImage = file;
    this.updateImagePreview(file);
  }

  // Helper method to update the image preview
  updateImagePreview(imageFile: Blob) {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewLogoUrl = reader.result;
    };
    reader.readAsDataURL(imageFile);
  }

  onReceiptSelected(event: any) {
    const file = event.target.files[0];

    // Check file size
    if (file.size > this.maxFileSize) {
      this.resizeImage(file, 1024, 1024).then(resizedFile => {
        this.team.receiptImage = resizedFile;
      }).catch(() => {
        alert('The image is too large and could not be resized.');
      });
    } else {
      this.team.receiptImage = file;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewReceiptUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.previewLogoUrl = null;
    this.team.logoImage = null;

    // Reset the input field so a new file can be uploaded
    const fileInput = document.getElementById('logoImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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

  resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height *= maxWidth / width));
              width = maxWidth;
            } else {
              width = Math.round((width *= maxHeight / height));
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(blob => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              reject(new Error('Canvas is empty'));
            }
          }, file.type, 0.7);
        };
      };
      reader.readAsDataURL(file);
    });
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
