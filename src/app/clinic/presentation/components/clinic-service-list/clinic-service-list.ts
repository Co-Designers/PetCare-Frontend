import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { ClinicServiceService } from '../../../application/clinic-service';
import { ClinicServiceFormComponent } from '../clinic-service-form/clinic-service-form';

@Component({
  selector: 'app-clinic-service-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './clinic-service-list.html',
  styleUrls: ['./clinic-service-list.css'],
})
export class ClinicServiceListComponent implements OnInit {
  private serviceService = inject(ClinicServiceService);
  private dialog = inject(MatDialog);

  get services() {
    return this.serviceService.services();
  }
  get loading() {
    return this.serviceService.loading();
  }

  ngOnInit(): void {
    this.serviceService.loadServices();
  }

  openAddDialog(): void {
    this.dialog
      .open(ClinicServiceFormComponent, { width: '500px', data: { mode: 'create' } })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.serviceService.loadServices();
      });
  }

  editService(service: any): void {
    this.dialog
      .open(ClinicServiceFormComponent, { width: '500px', data: { mode: 'edit', service } })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.serviceService.loadServices();
      });
  }

  deleteService(id: number): void {
    if (confirm('¿Eliminar este servicio?')) {
      this.serviceService.deleteService(id);
    }
  }
}
