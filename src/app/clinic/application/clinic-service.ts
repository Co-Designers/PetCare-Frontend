import { Injectable, inject, signal } from '@angular/core';
import {
  ClinicServiceApiService,
  ClinicService,
} from '../infrastructure/clinic-service-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';

@Injectable({ providedIn: 'root' })
export class ClinicServiceService {
  private api = inject(ClinicServiceApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);

  private servicesSignal = signal<ClinicService[]>([]);
  public readonly services = this.servicesSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  loadServices(): void {
    const clinicId = this.iamStore.currentUserId();
    if (clinicId === null || clinicId === undefined) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.api.getByClinic(clinicId).subscribe({
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

  createService(service: Omit<ClinicService, 'id'>): void {
    const clinicId = this.iamStore.currentUserId();
    if (!clinicId) return;
    const serviceWithClinic = { ...service, clinicId };
    this.api.create(serviceWithClinic).subscribe({
      next: (newService) => {
        this.servicesSignal.update((services) => [...services, newService]);
        this.notification.success('Servicio agregado');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error creating service');
        this.notification.error('Error al agregar servicio');
      },
    });
  }

  updateService(id: number, data: Partial<ClinicService>): void {
    this.api.update(id, data).subscribe({
      next: (updated) => {
        this.servicesSignal.update((services) => services.map((s) => (s.id === id ? updated : s)));
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
        this.servicesSignal.update((services) => services.filter((s) => s.id !== id));
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
