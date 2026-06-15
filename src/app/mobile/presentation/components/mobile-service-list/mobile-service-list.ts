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
  private serviceService = inject(MobileServiceService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);

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
      .open(MobileServiceFormComponent, { width: '500px', data: { mode: 'create' } })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.serviceService.loadServices();
      });
  }

  editService(service: any): void {
    this.dialog
      .open(MobileServiceFormComponent, { width: '500px', data: { mode: 'edit', service } })
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
