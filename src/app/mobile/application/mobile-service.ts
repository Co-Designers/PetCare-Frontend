import { Injectable, inject, signal } from '@angular/core';
import {
  MobileServiceApiService,
  MobileService,
} from '../infrastructure/mobile-service-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';

@Injectable({ providedIn: 'root' })
export class MobileServiceService {
  private api = inject(MobileServiceApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);

  private servicesSignal = signal<MobileService[]>([]);
  public readonly services = this.servicesSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  loadServices(): void {
    const mobileId = this.iamStore.currentUserId();
    if (!mobileId) return;
    this.loading.set(true);
    this.api.getByMobileId(mobileId).subscribe({
      next: (services) => {
        this.servicesSignal.set(services);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error loading services');
        this.loading.set(false);
        this.notification.error('Error al cargar servicios');
      },
    });
  }

  createService(service: Omit<MobileService, 'id'>): void {
    const mobileId = this.iamStore.currentUserId();
    if (!mobileId) return;
    const serviceWithMobile = { ...service, mobileId };
    this.api.create(serviceWithMobile).subscribe({
      next: (newService) => {
        this.servicesSignal.update((list) => [...list, newService]);
        this.notification.success('Servicio agregado');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error creating service');
        this.notification.error('Error al agregar servicio');
      },
    });
  }

  updateService(id: number, data: Partial<MobileService>): void {
    this.api.update(id, data).subscribe({
      next: (updated) => {
        this.servicesSignal.update((list) => list.map((s) => (s.id === id ? updated : s)));
        this.notification.success('Servicio actualizado');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error updating service');
        this.notification.error('Error al actualizar servicio');
      },
    });
  }

  deleteService(id: number): void {
    this.api.delete(id).subscribe({
      next: () => {
        this.servicesSignal.update((list) => list.filter((s) => s.id !== id));
        this.notification.success('Servicio eliminado');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error deleting service');
        this.notification.error('Error al eliminar servicio');
      },
    });
  }
}
