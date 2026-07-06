import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IamStore } from '../../iam/application/iam-store';
import { environment } from '../../../environments/environment';

export interface Alert {
  id: number;
  petId?: number;
  petName?: string;
  type: string;
  title?: string;
  message: string;
  dueDate?: string;
  isRead: boolean;
}

@Injectable({ providedIn: 'root' })
export class OwnerAlertService {
  private http = inject(HttpClient);
  private iamStore = inject(IamStore);
  private baseUrl = environment.platformProviderApiBaseUrl;

  private alertsSignal = signal<Alert[]>([]);
  public readonly alerts = this.alertsSignal.asReadonly();
  public readonly loading = signal<boolean>(false);

  loadAlerts(): void {
    const ownerId = this.iamStore.currentUserId();
    if (!ownerId) return;
    this.loading.set(true);
    this.http.get<any[]>(`${this.baseUrl}/notifications/user/${ownerId}`).subscribe({
      next: (notifications) => {
        const alerts = (notifications || []).map((notification) => ({
          id: notification.id,
          petId: notification.relatedEntityType === 'pet' ? notification.relatedEntityId : undefined,
          petName: '',
          type: notification.type,
          title: notification.title,
          message: notification.message,
          dueDate: notification.createdAt,
          isRead: !!notification.readStatus,
        }));
        this.alertsSignal.set(alerts);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.alertsSignal.set([]);
      },
    });
  }
}
