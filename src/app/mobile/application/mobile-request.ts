import { Injectable, inject, signal } from '@angular/core';
import {
  MobileRequestApiService,
  MobileRequest,
} from '../infrastructure/mobile-request-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MobileRequestService {
  private api = inject(MobileRequestApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);

  private requestsSignal = signal<MobileRequest[]>([]);
  public readonly requests = this.requestsSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  loadRequests(): void {
    const mobileId = this.iamStore.currentUserId();
    if (!mobileId) return;
    this.loading.set(true);
    this.api.getByMobileId(mobileId).subscribe({
      next: (requests) => {
        this.requestsSignal.set(requests);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error loading requests');
        this.loading.set(false);
        this.notification.error('Error al cargar solicitudes');
      },
    });
  }

  acceptRequest(id: number): void {
    this.api.update(id, { status: 'accepted' }).subscribe({
      next: (updated) => {
        this.requestsSignal.update((list) => list.map((r) => (r.id === id ? updated : r)));
        this.notification.success('Solicitud aceptada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error accepting request');
        this.notification.error('Error al aceptar solicitud');
      },
    });
  }

  rejectRequest(id: number): void {
    this.api.update(id, { status: 'rejected' }).subscribe({
      next: (updated) => {
        this.requestsSignal.update((list) => list.map((r) => (r.id === id ? updated : r)));
        this.notification.success('Solicitud rechazada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error rejecting request');
        this.notification.error('Error al rechazar solicitud');
      },
    });
  }

  completeRequest(id: number): void {
    this.api.update(id, { status: 'completed' }).subscribe({
      next: (updated) => {
        this.requestsSignal.update((list) => list.map((r) => (r.id === id ? updated : r)));
        this.notification.success('Servicio completado');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error completing request');
        this.notification.error('Error al completar servicio');
      },
    });
  }

  getRequestById(id: number): Observable<MobileRequest> {
    return this.api.getById(id);
  }
}
