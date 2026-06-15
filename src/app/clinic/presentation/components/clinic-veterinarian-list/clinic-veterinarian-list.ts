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
  private vetService = inject(ClinicVeterinarianService);
  private dialog = inject(MatDialog);

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
      .open(ClinicVeterinarianFormComponent, { width: '500px', data: { mode: 'create' } })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.vetService.loadVeterinarians();
      });
  }

  editVet(vet: any): void {
    this.dialog
      .open(ClinicVeterinarianFormComponent, {
        width: '500px',
        data: { mode: 'edit', veterinarian: vet },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.vetService.loadVeterinarians();
      });
  }

  deleteVet(id: number): void {
    if (confirm('¿Eliminar este veterinario?')) {
      this.vetService.deleteVeterinarian(id);
    }
  }
}
