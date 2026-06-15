import { Injectable, inject, signal } from '@angular/core';
import {
  MobileAppointmentApiService,
  MobileAppointment,
} from '../infrastructure/mobile-appointment-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';

@Injectable({ providedIn: 'root' })
export class MobileAppointmentService {
  private api = inject(MobileAppointmentApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);

  private appointmentsSignal = signal<MobileAppointment[]>([]);
  public readonly appointments = this.appointmentsSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  loadAppointments(): void {
    const mobileId = this.iamStore.currentUserId();
    if (!mobileId) return;
    this.loading.set(true);
    this.api.getByMobileId(mobileId).subscribe({
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

  completeAppointment(id: number): void {
    this.api.update(id, { status: 'completed' }).subscribe({
      next: (updated) => {
        this.appointmentsSignal.update((list) => list.map((a) => (a.id === id ? updated : a)));
        this.notification.success('Cita completada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error completing appointment');
        this.notification.error('Error al completar cita');
      },
    });
  }
}
