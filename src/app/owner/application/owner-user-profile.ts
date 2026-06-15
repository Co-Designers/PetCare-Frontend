import { Injectable, inject, signal } from '@angular/core';
import { IamStore } from '../../iam/application/iam-store';
import {
  OwnerUserProfileApiService,
  OwnerUserProfile,
} from '../infrastructure/owner-user-profile-api';
import { NotificationService } from '../../shared/application/notification';

@Injectable({ providedIn: 'root' })
export class OwnerUserProfileService {
  private api = inject(OwnerUserProfileApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);

  private profileSignal = signal<OwnerUserProfile | null>(null);
  public readonly profile = this.profileSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  /** Cargar perfil del dueño autenticado */
  loadProfile(): void {
    const userId = this.iamStore.currentUserId();
    if (!userId) return;
    this.loading.set(true);
    this.api.get(userId).subscribe({
      next: (profile) => {
        this.profileSignal.set(profile);
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

  /** Actualizar perfil */
  updateProfile(data: Partial<OwnerUserProfile>): void {
    const userId = this.iamStore.currentUserId();
    if (!userId) return;
    this.api.update(userId, data).subscribe({
      next: (updated) => {
        this.profileSignal.set(updated);
        this.notification.success('Perfil actualizado');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error updating profile');
        this.notification.error('Error al actualizar perfil');
      },
    });
  }

  /** Cambiar contraseña */
  changePassword(currentPassword: string, newPassword: string): void {
    const userId = this.iamStore.currentUserId();
    if (!userId) return;
    this.api.changePassword(userId, currentPassword, newPassword).subscribe({
      next: () => {
        this.notification.success('Contraseña cambiada');
      },
      error: (err) => {
        console.error(err);
        let msg = 'Error al cambiar contraseña';
        if (err.status === 401) msg = 'Contraseña actual incorrecta';
        this.error.set(msg);
        this.notification.error(msg);
      },
    });
  }
}
