import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { OwnerPetService } from '../../../application/owner-pet';
import { OwnerPetFormComponent } from '../owner-pet-form/owner-pet-form';

@Component({
  selector: 'app-owner-pet-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './owner-pet-list.html',
  styleUrls: ['./owner-pet-list.css'],
})
export class OwnerPetListComponent implements OnInit {
  private readonly petService = inject(OwnerPetService);
  private readonly dialog = inject(MatDialog);

  pageSize = 6;
  currentPage = 1;

  private readonly fallbackPetImage =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#edf4ff"/>
            <stop offset="100%" stop-color="#fff3d8"/>
          </linearGradient>
        </defs>
        <rect width="900" height="600" fill="url(#bg)"/>
        <circle cx="450" cy="280" r="115" fill="#1a3458" opacity="0.10"/>
        <text x="450" y="300" text-anchor="middle" font-size="90" font-family="Arial">🐾</text>
        <text x="450" y="395" text-anchor="middle" font-size="38" font-family="Arial" font-weight="700" fill="#1a3458">PetCare</text>
      </svg>
    `);

  get pets() {
    return this.petService.pets();
  }

  get loading() {
    return this.petService.loading();
  }

  get paginatedPets() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.pets.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.pets.length / this.pageSize);
  }

  ngOnInit(): void {
    this.petService.loadPets();
  }

  getPetImage(pet: any): string {
    return pet?.photoUrl || this.fallbackPetImage;
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = this.fallbackPetImage;
  }

  getPetAge(birthDate?: string | Date): string {
    if (!birthDate) return 'No registrado';

    const birth = new Date(birthDate);

    if (Number.isNaN(birth.getTime())) return 'No registrado';

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age <= 0) return 'Menos de 1 año';

    return age === 1 ? '1 año' : `${age} años`;
  }

  openAddDialog(): void {
    this.dialog
      .open(OwnerPetFormComponent, {
        width: '520px',
        data: { mode: 'create' },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.petService.loadPets();
      });
  }

  editPet(pet: any): void {
    this.dialog
      .open(OwnerPetFormComponent, {
        width: '520px',
        data: { mode: 'edit', pet },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.petService.loadPets();
      });
  }

  deletePet(id: number): void {
    if (confirm('¿Eliminar esta mascota?')) {
      this.petService.deletePet(id);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
