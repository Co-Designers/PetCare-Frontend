import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { TranslatePipe } from '@ngx-translate/core';

import { MobileServiceService } from '../../../application/mobile-service';
import { MobileServiceFormComponent } from '../mobile-service-form/mobile-service-form';
import { NotificationService } from '../../../../shared/application/notification';

@Component({
  selector: 'app-mobile-service-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './mobile-service-list.html',
  styleUrls: ['./mobile-service-list.css'],
})
export class MobileServiceListComponent implements OnInit {
  private readonly serviceService = inject(MobileServiceService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  get services(): any[] {
    return this.serviceService.services() as any[];
  }

  get loading(): boolean {
    return this.serviceService.loading();
  }

  ngOnInit(): void {
    this.serviceService.loadServices();
  }

  openAddDialog(): void {
    this.dialog
      .open(MobileServiceFormComponent, {
        width: '560px',
        maxWidth: '95vw',
        data: { mode: 'create' },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.serviceService.loadServices();
        }
      });
  }

  editService(service: any): void {
    this.dialog
      .open(MobileServiceFormComponent, {
        width: '560px',
        maxWidth: '95vw',
        data: { mode: 'edit', service },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.serviceService.loadServices();
        }
      });
  }

  deleteService(id: number): void {
    if (!id) return;

    if (confirm('¿Eliminar este servicio?')) {
      this.serviceService.deleteService(id);
      this.notification.success('Servicio eliminado correctamente');

      setTimeout(() => {
        this.serviceService.loadServices();
      }, 250);
    }
  }

  getDurationLabel(service: any): string {
    const duration = Number(service?.durationMinutes || service?.duration || 0);

    if (!duration) return 'No registrado';

    return `${duration} min`;
  }

  getPriceLabel(service: any): string {
    const price = Number(service?.price || 0);

    return `S/ ${price.toFixed(2)}`;
  }
}
