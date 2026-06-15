import { Injectable, inject, signal } from '@angular/core';
import {
  MobileProfessionalApiService,
  MobileProfessional,
} from '../infrastructure/mobile-professional-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';

@Injectable({ providedIn: 'root' })
export class MobileProfessionalService {
  private api = inject(MobileProfessionalApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);

  private profileSignal = signal<MobileProfessional | null>(null);
  public readonly profile = this.profileSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);
  private professionalIdSignal = signal<number | null>(null);

  loadProfile(): void {
    const userId = this.iamStore.currentUserId();
    if (!userId) return;
    this.loading.set(true);
    this.api.getByUserId(userId).subscribe({
      next: (professionals) => {
        if (professionals && professionals.length > 0) {
          const professional = professionals[0];
          this.profileSignal.set(professional);
          this.professionalIdSignal.set(professional.id!);
        } else {
          this.profileSignal.set(null);
          this.professionalIdSignal.set(null);
        }
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error loading profile');
        this.loading.set(false);
        this.notification.error('Error al cargar perfil');
      },
    });
  }

  updateProfile(data: Partial<MobileProfessional>): void {
    const professionalId = this.professionalIdSignal();
    if (!professionalId) {
      this.notification.error('No se encontró el perfil profesional');
      return;
    }
    this.loading.set(true);
    this.api.update(professionalId, data).subscribe({
      next: (updated) => {
        this.profileSignal.set(updated);
        this.loading.set(false);
        this.notification.success('Perfil actualizado');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error updating profile');
        this.loading.set(false);
        this.notification.error('Error al actualizar perfil');
      },
    });
  }
}
