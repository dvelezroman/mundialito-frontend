import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {TeamService} from "../../services/team.service";
import {Router} from "@angular/router";
import {PersonService} from "../../services/person.service";
import {CommonModule, NgForOf, NgIf} from "@angular/common";

export interface Team {
  name: string;
  country: string;
  city: string;
  managerId?: number | null;  
  logoImage?: File | null;  
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
    managerId: null,  // Inicializado como null
    logoImage: null   // Inicializado como null
  };

  people = [] as any[];
  previewLogoUrl: string | ArrayBuffer | null = null;
  selectedLogoFile: File | null = null;

  constructor(
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


  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedLogoFile = input.files[0];  // Guardamos el archivo seleccionado
      const reader = new FileReader();
      reader.onload = () => {
        this.previewLogoUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedLogoFile);
    }
  }

  removeLogo() {
    this.previewLogoUrl = null;
    this.selectedLogoFile = null;  // Limpiamos el archivo seleccionado
  }



  onSubmit() {
    const formData = new FormData();
    formData.append('name', this.team.name);
    formData.append('country', this.team.country);
    formData.append('city', this.team.city);
  
    // No incluimos managerId si es null o undefined
    if (this.team.managerId !== null && this.team.managerId !== undefined) {
      formData.append('managerId', this.team.managerId.toString());
    }
  
    // No incluimos logoImage si no se seleccionó una imagen
    if (this.selectedLogoFile) {
      formData.append('logoImage', this.selectedLogoFile);
    }
  
    this.teamService.createTeam(formData).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error creating team', error);
        console.log('Server response:', error.error);  // Verifica qué información se está enviando
      }
    });
  }

  onCancel() {
    this.router.navigate(['/home']);
  }
}
