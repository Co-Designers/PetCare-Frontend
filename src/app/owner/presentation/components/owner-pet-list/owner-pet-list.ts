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
  private petService = inject(OwnerPetService);
  private dialog = inject(MatDialog);

  // Paginación
  pageSize = 6;
  currentPage = 1;

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

  openAddDialog(): void {
    this.dialog
      .open(OwnerPetFormComponent, { width: '500px', data: { mode: 'create' } })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.petService.loadPets();
      });
  }

  editPet(pet: any): void {
    this.dialog
      .open(OwnerPetFormComponent, { width: '500px', data: { mode: 'edit', pet } })
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
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }
}
