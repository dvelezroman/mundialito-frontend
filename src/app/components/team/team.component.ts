import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {TeamService} from "../../services/team.service";
import {Router} from "@angular/router";
import {PersonService} from "../../services/person.service";
import {CommonModule, NgForOf, NgIf} from "@angular/common";

export interface Team {
  name: string;
  logoImage?: string;  // Opcional
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
    logoImage: ''  // Inicializado como null
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
        this.team.logoImage = reader.result as string;  // Convertimos la imagen a base64
      };
      reader.readAsDataURL(this.selectedLogoFile);
    }
  }


  removeLogo() {
    this.previewLogoUrl = null;
    this.selectedLogoFile = null;
    this.team.logoImage = '';  // Limpiamos la imagen seleccionada
  }


  onSubmit() {
    // Como logoImage es opcional, lo enviamos solo si no está vacío
    if (!this.team.logoImage) {
      delete this.team.logoImage;
    }

    this.teamService.createTeam(this.team).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error creating team', error);
      }
    });
  }



  onCancel() {
    this.router.navigate(['/home']);
  }
}
