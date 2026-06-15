import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ClinicAppointmentService } from '../../../application/clinic-appointment';
import { ClinicPatientService } from '../../../application/clinic-patient';

@Component({
  selector: 'app-clinic-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './clinic-dashboard.html',
  styleUrls: ['./clinic-dashboard.css'],
})
export class ClinicDashboardComponent implements OnInit {
  private appointmentService = inject(ClinicAppointmentService);
  private patientService = inject(ClinicPatientService);

  get appointments() {
    return this.appointmentService.appointments();
  }
  get patients() {
    return this.patientService.patients();
  }
  get loadingAppointments() {
    return this.appointmentService.loading();
  }
  get loadingPatients() {
    return this.patientService.loading();
  }

  ngOnInit(): void {
    this.appointmentService.loadAppointments();
    this.patientService.loadPatients();
  }

  getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments.filter((a) => a.dateTime.startsWith(today));
  }

  getPendingAppointments() {
    return this.appointments.filter((a) => a.status === 'pending');
  }
}
