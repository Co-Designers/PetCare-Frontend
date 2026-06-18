import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslatePipe } from '@ngx-translate/core';

import { OwnerPetService } from '../../../application/owner-pet';
import { OwnerAppointmentService } from '../../../application/owner-appointment';
import { OwnerAlertService } from '../../../application/owner-alert';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './owner-dashboard.html',
  styleUrls: ['./owner-dashboard.css'],
})
export class OwnerDashboardComponent implements OnInit {
  private readonly petService = inject(OwnerPetService);
  private readonly appointmentService = inject(OwnerAppointmentService);
  private readonly alertService = inject(OwnerAlertService);

  get pets(): any[] {
    return this.petService.pets() as any[];
  }

  get appointments(): any[] {
    return this.appointmentService.appointments() as any[];
  }

  get loadingPets(): boolean {
    return this.petService.loading();
  }

  get loadingAppointments(): boolean {
    return this.appointmentService.loading();
  }

  get healthAlerts(): any[] {
    return this.alertService.alerts() as any[];
  }

  get loadingAlerts(): boolean {
    return this.alertService.loading();
  }

  ngOnInit(): void {
    this.petService.loadPets();
    this.appointmentService.loadAppointments();
    this.alertService.loadAlerts();
  }

  getUpcomingAppointments(): any[] {
    const now = new Date();

    return this.appointments
      .filter((appointment: any) => {
        const dateTime = appointment?.dateTime;
        const status = String(appointment?.status || '').toLowerCase();

        if (!dateTime) return false;

        const appointmentDate = new Date(dateTime);

        if (Number.isNaN(appointmentDate.getTime())) return false;

        const isActive = status === 'pending' || status === 'confirmed' || status === 'accepted';

        return appointmentDate >= now && isActive;
      })
      .sort((a: any, b: any) => {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      })
      .slice(0, 3);
  }
}
