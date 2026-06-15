import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IamStore } from '../../iam/application/iam-store';
import { environment } from '../../../environments/environment';

export interface Alert {
  id: string;
  petId: number;
  petName: string;
  type: string;
  message: string;
  dueDate: string;
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
    this.http.get<Alert[]>(`${this.baseUrl}/alerts?ownerId=${ownerId}`).subscribe({
      next: (alerts) => {
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
