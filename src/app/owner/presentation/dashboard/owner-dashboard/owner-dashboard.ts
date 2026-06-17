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

  get pets() {
    return this.petService.pets();
  }

  get appointments() {
    return this.appointmentService.appointments();
  }

  get loadingPets() {
    return this.petService.loading();
  }

  get loadingAppointments() {
    return this.appointmentService.loading();
  }

  get healthAlerts() {
    return this.alertService.alerts();
  }

  get loadingAlerts() {
    return this.alertService.loading();
  }

  ngOnInit(): void {
    this.petService.loadPets();
    this.appointmentService.loadAppointments();
    this.alertService.loadAlerts();
  }

  getUpcomingAppointments() {
    const now = new Date();

    return this.appointments
      .filter((appointment) => new Date(appointment.dateTime) >= now)
      .slice(0, 3);
  }
}
