import { Injectable, inject, signal } from '@angular/core';
import {
  ClinicAppointmentApiService,
  ClinicAppointment,
} from '../infrastructure/clinic-appointment-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClinicAppointmentService {
  private api = inject(ClinicAppointmentApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);

  private appointmentsSignal = signal<ClinicAppointment[]>([]);
  public readonly appointments = this.appointmentsSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  loadAppointments(): void {
    const clinicId = this.iamStore.currentUserId();
    if (clinicId === null || clinicId === undefined) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.api.getByClinic(clinicId).subscribe({
      next: (apps) => {
        this.appointmentsSignal.set(apps);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error loading appointments');
        this.loading.set(false);
        this.notification.error('Error al cargar citas');
      },
    });
  }

  getAppointmentById(id: number): Observable<ClinicAppointment> {
    return this.api.getById(id);
  }

  createAppointment(appointment: Omit<ClinicAppointment, 'id'>): void {
    this.api.create(appointment).subscribe({
      next: (newApp) => {
        this.appointmentsSignal.update((apps) => [...apps, newApp]);
        this.notification.success('Cita creada exitosamente');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error creating appointment');
        this.notification.error('Error al crear la cita');
      },
    });
  }

  updateAppointmentStatus(id: number, status: ClinicAppointment['status']): void {
    this.api.update(id, { status }).subscribe({
      next: (updated) => {
        this.appointmentsSignal.update((apps) => apps.map((a) => (a.id === id ? updated : a)));
        const msg =
          status === 'confirmed'
            ? 'confirmada'
            : status === 'completed'
              ? 'completada'
              : 'actualizada';
        this.notification.success(`Cita ${msg}`);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error updating appointment');
        this.notification.error('Error al actualizar cita');
      },
    });
  }

  updateAppointment(id: number, updates: Partial<ClinicAppointment>): void {
    this.api.update(id, updates).subscribe({
      next: (updated) => {
        this.appointmentsSignal.update((apps) => apps.map((a) => (a.id === id ? updated : a)));
        this.notification.success('Cita actualizada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error updating appointment');
        this.notification.error('Error al actualizar cita');
      },
    });
  }

  completeAppointment(id: number): void {
    this.api.complete(id).subscribe({
      next: () => {
        this.appointmentsSignal.update((apps) =>
          apps.map((appointment) =>
            appointment.id === id
              ? { ...appointment, status: 'completed', paymentStatus: 'paid' }
              : appointment,
          ),
        );
        this.notification.success('Cita completada y pago registrado');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error completing appointment');
        this.notification.error('Error al completar cita');
      },
    });
  }

  cancelAppointment(id: number): void {
    this.api.cancel(id).subscribe({
      next: () => {
        this.appointmentsSignal.update((apps) =>
          apps.map((appointment) =>
            appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment,
          ),
        );
        this.notification.success('Cita cancelada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error cancelling appointment');
        this.notification.error('Error al cancelar cita');
      },
    });
  }
}
