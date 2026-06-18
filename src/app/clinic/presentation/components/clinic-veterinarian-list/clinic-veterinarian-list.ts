import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { TranslatePipe } from '@ngx-translate/core';

import { ClinicVeterinarianService } from '../../../application/clinic-veterinarian';
import { ClinicVeterinarianFormComponent } from '../clinic-veterinarian-form/clinic-veterinarian-form';

@Component({
  selector: 'app-clinic-veterinarian-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './clinic-veterinarian-list.html',
  styleUrls: ['./clinic-veterinarian-list.css'],
})
export class ClinicVeterinarianListComponent implements OnInit {
  private readonly vetService = inject(ClinicVeterinarianService);
  private readonly dialog = inject(MatDialog);

  get vets() {
    return this.vetService.veterinarians();
  }

  get loading() {
    return this.vetService.loading();
  }

  ngOnInit(): void {
    this.vetService.loadVeterinarians();
  }

  openAddDialog(): void {
    this.dialog
      .open(ClinicVeterinarianFormComponent, {
        width: '560px',
        maxWidth: '95vw',
        data: { mode: 'create' },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.vetService.loadVeterinarians();
        }
      });
  }

  editVet(vet: any): void {
    this.dialog
      .open(ClinicVeterinarianFormComponent, {
        width: '560px',
        maxWidth: '95vw',
        data: {
          mode: 'edit',
          veterinarian: vet,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.vetService.loadVeterinarians();
        }
      });
  }

  deleteVet(id: number): void {
    const confirmed = confirm('¿Eliminar este veterinario?');

    if (!confirmed) return;

    this.vetService.deleteVeterinarian(id);

    setTimeout(() => {
      this.vetService.loadVeterinarians();
    }, 250);
  }

  getVetInitials(vet: any): string {
    const name = vet?.name || 'V';

    return name
      .split(' ')
      .filter((part: string) => !!part)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join('');
  }

  getVetPhone(vet: any): string {
    return vet?.phone || 'No registrado';
  }

  getVetEmail(vet: any): string {
    return vet?.email || 'No registrado';
  }

  getVetsWithLicense(): number {
    return this.vets.filter((vet: any) => !!vet?.licenseNumber).length;
  }

  getSpecialtyCount(): number {
    const specialties = new Set(
      this.vets
        .map((vet: any) => vet?.specialty)
        .filter((specialty: string | null | undefined) => !!specialty),
    );

    return specialties.size;
  }
}
