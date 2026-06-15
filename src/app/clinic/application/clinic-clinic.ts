import { Injectable, inject, signal } from '@angular/core';
import { ClinicClinicApiService, ClinicProfile } from '../infrastructure/clinic-clinic-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';

@Injectable({ providedIn: 'root' })
export class ClinicClinicService {
  private api = inject(ClinicClinicApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);

  private clinicSignal = signal<ClinicProfile | null>(null);
  public readonly clinic = this.clinicSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  loadClinicProfile(): void {
    const clinicId = this.iamStore.currentUserId();
    if (clinicId === null || clinicId === undefined) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.api.getById(clinicId).subscribe({
      next: (profile) => {
        this.clinicSignal.set(profile);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error loading clinic profile');
        this.loading.set(false);
        this.notification.error('Error al cargar perfil de clínica');
      },
    });
  }

  updateProfile(data: Partial<ClinicProfile>): void {
    const clinicId = this.iamStore.currentUserId();
    if (clinicId === null || clinicId === undefined) return;
    this.loading.set(true);
    this.api.update(clinicId, data).subscribe({
      next: (updated) => {
        this.clinicSignal.set(updated);
        this.loading.set(false);
        this.notification.success('Perfil actualizado');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error updating clinic profile');
        this.loading.set(false);
        this.notification.error('Error al actualizar perfil');
      },
    });
  }
}
