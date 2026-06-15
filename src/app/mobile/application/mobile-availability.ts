import { Injectable, inject, signal } from '@angular/core';
import {
  MobileAvailabilityApiService,
  TimeSlot,
} from '../infrastructure/mobile-availability-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';

@Injectable({ providedIn: 'root' })
export class MobileAvailabilityService {
  private api = inject(MobileAvailabilityApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);

  private slotsSignal = signal<TimeSlot[]>([]);
  public readonly slots = this.slotsSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  loadSlots(date?: string): void {
    const mobileId = this.iamStore.currentUserId();
    if (!mobileId) return;
    this.loading.set(true);
    this.api.getByMobileId(mobileId, date).subscribe({
      next: (slots) => {
        this.slotsSignal.set(slots);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error loading availability');
        this.loading.set(false);
        this.notification.error('Error al cargar disponibilidad');
      },
    });
  }

  createSlot(slot: Omit<TimeSlot, 'id'>): void {
    const mobileId = this.iamStore.currentUserId();
    if (!mobileId) return;
    const slotWithMobile = { ...slot, mobileId };
    this.api.create(slotWithMobile).subscribe({
      next: (newSlot) => {
        this.slotsSignal.update((list) => [...list, newSlot]);
        this.notification.success('Disponibilidad guardada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error creating slot');
        this.notification.error('Error al guardar disponibilidad');
      },
    });
  }

  updateSlot(id: number, data: Partial<TimeSlot>): void {
    this.api.update(id, data).subscribe({
      next: (updated) => {
        this.slotsSignal.update((list) => list.map((s) => (s.id === id ? updated : s)));
        this.notification.success('Disponibilidad actualizada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error updating slot');
        this.notification.error('Error al actualizar disponibilidad');
      },
    });
  }

  deleteSlot(id: number): void {
    this.api.delete(id).subscribe({
      next: () => {
        this.slotsSignal.update((list) => list.filter((s) => s.id !== id));
        this.notification.success('Disponibilidad eliminada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error deleting slot');
        this.notification.error('Error al eliminar disponibilidad');
      },
    });
  }
}
