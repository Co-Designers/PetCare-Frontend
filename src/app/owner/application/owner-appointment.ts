import { Injectable, inject, signal } from '@angular/core';
import { IamStore } from '../../iam/application/iam-store';
import { OwnerAppointmentApiService } from '../infrastructure/owner-appointment-api';
import { OwnerAppointmentEntity } from '../domain/model/owner-appointment-entity';
import { NotificationService } from '../../shared/application/notification';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OwnerAppointmentService {
  private api = inject(OwnerAppointmentApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);

  private appointmentsSignal = signal<OwnerAppointmentEntity[]>([]);
  public readonly appointments = this.appointmentsSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  /** Cargar todas las citas del dueño autenticado */
  loadAppointments(): void {
    const ownerId = this.iamStore.currentUserId();
    if (!ownerId) return;
    this.loading.set(true);
    this.api.getByOwner(ownerId).subscribe({
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

  /** Obtener una cita por ID (para edición/detalle) */
  getAppointmentById(id: number): Observable<OwnerAppointmentEntity> {
    return this.api.getById(id);
  }

  /** Crear una nueva cita */
  createAppointment(appointment: Omit<OwnerAppointmentEntity, 'id'>): void {
    this.api.create(appointment).subscribe({
      next: (created) => {
        this.appointmentsSignal.update((list) => [...list, created]);
        this.notification.success('Cita agendada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error creating appointment');
        this.notification.error('Error al agendar cita');
      },
    });
  }

  /** Actualizar una cita (reprogramar, cambiar estado, etc.) */
  updateAppointment(id: number, updates: Partial<OwnerAppointmentEntity>): void {
    this.api.update(id, updates).subscribe({
      next: (updated) => {
        this.appointmentsSignal.update((list) => list.map((a) => (a.id === id ? updated : a)));
        this.notification.success('Cita actualizada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error updating appointment');
        this.notification.error('Error al actualizar cita');
      },
    });
  }

  /** Cancelar una cita */
  cancelAppointment(id: number): void {
    this.api.delete(id).subscribe({
      next: () => {
        this.appointmentsSignal.update((list) => list.filter((a) => a.id !== id));
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
