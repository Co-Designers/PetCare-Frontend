import { Injectable, inject, signal } from '@angular/core';
import {
  ClinicVeterinarianApiService,
  ClinicVeterinarian,
} from '../infrastructure/clinic-veterinarian-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';

@Injectable({ providedIn: 'root' })
export class ClinicVeterinarianService {
  private api = inject(ClinicVeterinarianApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);

  private vetsSignal = signal<ClinicVeterinarian[]>([]);
  public readonly veterinarians = this.vetsSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  loadVeterinarians(): void {
    const clinicId = this.iamStore.currentUserId();
    if (clinicId === null || clinicId === undefined) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.api.getByClinic(clinicId).subscribe({
      next: (vets) => {
        this.vetsSignal.set(vets);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error loading veterinarians');
        this.loading.set(false);
        this.notification.error('Error al cargar veterinarios');
      },
    });
  }

  createVeterinarian(vet: Omit<ClinicVeterinarian, 'id'>): void {
    const clinicId = this.iamStore.currentUserId();
    if (!clinicId) return;
    const vetWithClinic = { ...vet, clinicId };
    this.api.create(vetWithClinic).subscribe({
      next: (newVet) => {
        this.vetsSignal.update((vets) => [...vets, newVet]);
        this.notification.success('Veterinario agregado');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error creating veterinarian');
        this.notification.error('Error al agregar veterinario');
      },
    });
  }

  updateVeterinarian(id: number, data: Partial<ClinicVeterinarian>): void {
    this.api.update(id, data).subscribe({
      next: (updated) => {
        this.vetsSignal.update((vets) => vets.map((v) => (v.id === id ? updated : v)));
        this.notification.success('Veterinario actualizado');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error updating veterinarian');
        this.notification.error('Error al actualizar veterinario');
      },
    });
  }

  deleteVeterinarian(id: number): void {
    this.api.delete(id).subscribe({
      next: () => {
        this.vetsSignal.update((vets) => vets.filter((v) => v.id !== id));
        this.notification.success('Veterinario eliminado');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error deleting veterinarian');
        this.notification.error('Error al eliminar veterinario');
      },
    });
  }
}
