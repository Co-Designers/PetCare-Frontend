import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { TranslatePipe } from '@ngx-translate/core';

import { ClinicAppointmentService } from '../../../application/clinic-appointment';
import { ClinicVeterinarianService } from '../../../application/clinic-veterinarian';
import { NotificationService } from '../../../../shared/application/notification';

@Component({
  selector: 'app-clinic-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslatePipe,
  ],
  templateUrl: './clinic-appointment-list.html',
  styleUrls: ['./clinic-appointment-list.css'],
})
export class ClinicAppointmentListComponent implements OnInit {
  private readonly appointmentService = inject(ClinicAppointmentService);
  private readonly vetService = inject(ClinicVeterinarianService);
  private readonly notification = inject(NotificationService);

  filterDate: Date | null = null;

  selectedVeterinarians: Record<number, number> = {};

  get appointments() {
    return this.appointmentService.appointments();
  }

  get loading() {
    return this.appointmentService.loading();
  }

  get veterinarians() {
    return this.vetService.veterinarians();
  }

  get filteredAppointments() {
    let list = this.appointments;

    if (this.filterDate) {
      const selectedDate = this.getDateOnly(this.filterDate);

      list = list.filter((appointment) => {
        return this.getDateOnly((appointment as any).dateTime) === selectedDate;
      });
    }

    return list;
  }

  ngOnInit(): void {
    this.appointmentService.loadAppointments();
    this.vetService.loadVeterinarians();
  }

  getAppointmentsByStatus(status: 'pending' | 'confirmed' | 'completed') {
    return this.filteredAppointments
      .filter((appointment) => (appointment as any).status === status)
      .sort((a, b) => {
        return new Date((a as any).dateTime).getTime() - new Date((b as any).dateTime).getTime();
      });
  }

  getSelectedVeterinarianId(appointment: any): number | null {
    const appointmentId = Number(appointment?.id);

    if (!appointmentId) return null;

    return this.selectedVeterinarians[appointmentId] || appointment.veterinarianId || null;
  }

  setSelectedVeterinarian(appointment: any, veterinarianId: number): void {
    const appointmentId = Number(appointment?.id);

    if (!appointmentId) return;

    this.selectedVeterinarians[appointmentId] = Number(veterinarianId);
  }

  confirmWithVeterinarian(appointment: any): void {
    const appointmentId = Number(appointment?.id);
    const veterinarianId = Number(this.selectedVeterinarians[appointmentId]);

    if (!appointmentId) {
      this.notification.error('No se encontró la cita');
      return;
    }

    if (!veterinarianId) {
      this.notification.error('Primero asigna un veterinario');
      return;
    }

    const updatedAppointment = {
      ...appointment,
      veterinarianId,
      status: 'confirmed',
      paymentStatus: 'pending',
    };

    this.appointmentService.updateAppointment(appointmentId, updatedAppointment);
    this.notification.success('Cita confirmada y veterinario asignado');

    setTimeout(() => {
      this.appointmentService.loadAppointments();
    }, 250);
  }

  completeAppointment(appointment: any): void {
    const appointmentId = Number(appointment?.id);

    if (!appointmentId) {
      this.notification.error('No se encontró la cita');
      return;
    }

    const updatedAppointment = {
      ...appointment,
      status: 'completed',
      paymentStatus: 'paid',
    };

    this.appointmentService.updateAppointment(appointmentId, updatedAppointment);
    this.notification.success('Cita completada y pago registrado');

    setTimeout(() => {
      this.appointmentService.loadAppointments();
    }, 250);
  }

  cancelAppointment(appointment: any): void {
    const appointmentId = Number(appointment?.id);

    if (!appointmentId) {
      this.notification.error('No se encontró la cita');
      return;
    }

    const updatedAppointment = {
      ...appointment,
      status: 'cancelled',
      paymentStatus: 'cancelled',
    };

    this.appointmentService.updateAppointment(appointmentId, updatedAppointment);
    this.notification.success('Cita cancelada');

    setTimeout(() => {
      this.appointmentService.loadAppointments();
    }, 250);
  }

  getPaymentLabel(status: string | null | undefined): string {
    const normalized = (status || '').toLowerCase();

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      paid: 'Pagado',
      completed: 'Pagado',
      cancelled: 'Cancelado',
      canceled: 'Cancelado',
    };

    return labels[normalized] || 'Pendiente';
  }

  resetFilters(): void {
    this.filterDate = null;
  }

  getVeterinarianName(veterinarianId: number | string | null | undefined): string {
    if (!veterinarianId) return 'No asignado';

    const veterinarian = this.veterinarians.find((vet) => {
      return Number((vet as any).id) === Number(veterinarianId);
    });

    return veterinarian?.name || `Veterinario #${veterinarianId}`;
  }

  getClinicReference(appointment: any): string {
    const clinicId =
      appointment?.clinicId ??
      appointment?.providerId ??
      appointment?.serviceProviderId ??
      appointment?.clinic?.id ??
      null;

    if (!clinicId) return '-';

    return `Clínica #${clinicId}`;
  }

  getStatusLabel(status: string | null | undefined): string {
    const normalized = (status || '').toLowerCase();

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
      canceled: 'Cancelada',
    };

    return labels[normalized] || status || 'Sin estado';
  }

  private getDateOnly(dateTime: string | Date | null | undefined): string {
    if (!dateTime) return '';

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return String(dateTime).split('T')[0];
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
