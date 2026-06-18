import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ClinicAppointmentService } from '../../../application/clinic-appointment';
import { ClinicPatientService } from '../../../application/clinic-patient';
import { ClinicVeterinarianService } from '../../../application/clinic-veterinarian';

@Component({
  selector: 'app-clinic-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './clinic-dashboard.html',
  styleUrls: ['./clinic-dashboard.css'],
})
export class ClinicDashboardComponent implements OnInit {
  private readonly appointmentService = inject(ClinicAppointmentService);
  private readonly patientService = inject(ClinicPatientService);
  private readonly veterinarianService = inject(ClinicVeterinarianService);

  get appointments(): any[] {
    return this.appointmentService.appointments() as any[];
  }

  get patients(): any[] {
    return this.patientService.patients() as any[];
  }

  get veterinarians(): any[] {
    return this.veterinarianService.veterinarians() as any[];
  }

  get loadingAppointments(): boolean {
    return this.appointmentService.loading();
  }

  get loadingPatients(): boolean {
    return this.patientService.loading();
  }

  get loadingVeterinarians(): boolean {
    return this.veterinarianService.loading();
  }

  ngOnInit(): void {
    this.appointmentService.loadAppointments();
    this.patientService.loadPatients();
    this.veterinarianService.loadVeterinarians();
  }

  getPendingAppointments(): any[] {
    return this.appointments.filter((appointment: any) => {
      const status = String(appointment?.status || '').toLowerCase();
      return status === 'pending';
    });
  }

  getUpcomingAppointments(): any[] {
    const now = new Date();

    return this.appointments
      .filter((appointment: any) => {
        const status = String(appointment?.status || '').toLowerCase();
        const dateTime = appointment?.dateTime;

        if (!dateTime) return false;

        const appointmentDate = new Date(dateTime);

        if (Number.isNaN(appointmentDate.getTime())) return false;

        return appointmentDate >= now && status === 'pending';
      })
      .sort((a: any, b: any) => {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      })
      .slice(0, 4);
  }

  getPetName(appointment: any): string {
    return (
      appointment?.petName ||
      appointment?.pet?.name ||
      appointment?.patientName ||
      'Mascota no registrada'
    );
  }

  getOwnerName(appointment: any): string {
    return (
      appointment?.ownerName ||
      appointment?.owner?.name ||
      appointment?.clientName ||
      'Dueño no registrado'
    );
  }

  getDateLabel(appointment: any): string {
    if (!appointment?.dateTime) return 'Fecha no registrada';

    const date = new Date(appointment.dateTime);

    if (Number.isNaN(date.getTime())) return 'Fecha no registrada';

    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusLabel(appointment: any): string {
    const status = String(appointment?.status || '').toLowerCase();

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      accepted: 'Aceptada',
      completed: 'Completada',
      cancelled: 'Cancelada',
      canceled: 'Cancelada',
    };

    return labels[status] || 'Sin estado';
  }

  getReasonLabel(appointment: any): string {
    return (
      appointment?.reason ||
      appointment?.description ||
      appointment?.serviceName ||
      appointment?.service ||
      'Consulta veterinaria'
    );
  }
}
