import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, of } from 'rxjs';
import { OwnerAppointmentService } from '../../../application/owner-appointment';
import { OwnerPetService } from '../../../application/owner-pet';
import { IamStore } from '../../../../iam/application/iam-store';
import { NotificationService } from '../../../../shared/application/notification';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-owner-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    TranslatePipe,
  ],
  templateUrl: './owner-appointment-list.html',
  styleUrls: ['./owner-appointment-list.css'],
})
export class OwnerAppointmentListComponent implements OnInit {
  private readonly appointmentService = inject(OwnerAppointmentService);
  private readonly petService = inject(OwnerPetService);
  private readonly http = inject(HttpClient);
  private readonly iamStore = inject(IamStore);
  private readonly notification = inject(NotificationService);

  private readonly providersMap = new Map<string, string>();
  private readonly mobileServicesMap = new Map<number, string>();
  mobileRequests: any[] = [];

  get appointments() {
    return this.appointmentService.appointments();
  }

  get loading() {
    return this.appointmentService.loading();
  }

  get pets() {
    return this.petService.pets();
  }

  get upcomingAppointments() {
    const now = new Date();

    return this.allAppointments
      .filter((appointment) => {
        const status = (appointment.status || '').toLowerCase();
        const appointmentDate = new Date(appointment.dateTime);

        const isPendingOrConfirmed =
          status === 'pending' ||
          status === 'confirmed' ||
          status === 'accepted' ||
          status === 'in_process';

        return appointmentDate >= now && isPendingOrConfirmed;
      })
      .sort((a, b) => {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      });
  }

  get pastAppointments() {
    const now = new Date();

    return this.allAppointments
      .filter((appointment) => {
        const status = (appointment.status || '').toLowerCase();
        const appointmentDate = new Date(appointment.dateTime);

        const isFinished =
          status === 'completed' ||
          status === 'cancelled' ||
          status === 'canceled' ||
          status === 'rejected';

        return appointmentDate < now || isFinished;
      })
      .sort((a, b) => {
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      });
  }

  ngOnInit(): void {
    this.appointmentService.loadAppointments();
    this.petService.loadPets();
    this.loadProviders();
    this.loadMobileServices();
    this.loadMobileRequests();
  }

  loadProviders(): void {
    const clinics$ = this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}/clinics`).pipe(
      map((clinics) =>
        (clinics || []).map((clinic) => ({
          ...clinic,
          type: 'clinic',
        })),
      ),
      catchError(() => of([] as any[])),
    );

    const mobileProfessionals$ = this.http
      .get<any[]>(`${environment.platformProviderApiBaseUrl}/mobile-professionals`)
      .pipe(
        map((professionals) =>
          (professionals || []).map((professional) => ({
            ...professional,
            type: 'mobile',
          })),
        ),
        catchError(() => of([] as any[])),
      );

    forkJoin([clinics$, mobileProfessionals$]).subscribe({
      next: ([clinics, mobileProfessionals]) => {
        [...clinics, ...mobileProfessionals].forEach((provider) => this.registerProvider(provider));
      },
      error: (error) => console.error('Error loading providers', error),
    });
  }

  getPetName(petId: number | string | null | undefined): string {
    const id = this.normalizeId(petId);

    if (!id) return 'Mascota no asignada';

    return this.pets.find((pet) => Number(pet.id) === Number(id))?.name || `Mascota #${id}`;
  }

  getServiceTitle(appointment: any): string {
    return (
      appointment?.serviceType ||
      appointment?.serviceName ||
      appointment?.type ||
      'Servicio veterinario'
    );
  }

  getAppointmentProviderName(appointment: any): string {
    const providerId = this.resolveProviderId(appointment);

    if (!providerId) return 'Proveedor no asignado';

    const providerType = this.normalizeProviderType(appointment?.providerType);

    return (
      this.providersMap.get(`${providerType}:${providerId}`) ||
      this.providersMap.get(`${providerId}`) ||
      `Proveedor #${providerId}`
    );
  }

  getProviderTypeLabel(providerType: string | null | undefined): string {
    const type = this.normalizeProviderType(providerType);

    if (type === 'clinic') return 'Clínica veterinaria';
    if (type === 'mobile') return 'Profesional móvil';

    return 'Proveedor';
  }

  getStatusLabel(status: string | null | undefined): string {
    const normalizedStatus = (status || '').toLowerCase();

    const labels: Record<string, string> = {
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      cancelled: 'Cancelada',
      canceled: 'Cancelada',
      rejected: 'Cancelada',
      completed: 'Completada',
      accepted: 'Aceptada',
      in_process: 'Aceptada',
    };

    return labels[normalizedStatus] || status || 'Sin estado';
  }

  getStatusClass(status: string | null | undefined): string {
    const normalizedStatus = (status || '').toLowerCase();

    if (
      normalizedStatus === 'confirmed' ||
      normalizedStatus === 'accepted' ||
      normalizedStatus === 'in_process'
    ) {
      return 'status-confirmed';
    }

    if (normalizedStatus === 'pending') {
      return 'status-pending';
    }

    if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
      return 'status-cancelled';
    }

    if (normalizedStatus === 'completed') {
      return 'status-completed';
    }

    return 'status-default';
  }

  isUpcoming(dateTime: string, status?: string): boolean {
    if (!dateTime) return false;

    const normalizedStatus = (status || '').toLowerCase();
    const appointmentDate = new Date(dateTime);

    return (
      appointmentDate >= new Date() &&
      (normalizedStatus === 'pending' ||
        normalizedStatus === 'confirmed' ||
        normalizedStatus === 'accepted')
    );
  }

  cancelAppointment(id: number): void {
    if (confirm('¿Cancelar esta cita?')) {
      this.appointmentService.cancelAppointment(id);
    }
  }

  cancelDisplayItem(appointment: any): void {
    if (this.isMobileRequest(appointment)) {
      this.cancelMobileRequest(appointment.requestId);
      return;
    }

    this.cancelAppointment(Number(appointment.id));
  }

  isMobileRequest(appointment: any): boolean {
    return appointment?.source === 'mobile-request';
  }

  getAppointmentTrackId(appointment: any): string {
    return `${appointment?.source || 'appointment'}-${appointment?.id || appointment?.requestId}`;
  }

  private get allAppointments(): any[] {
    return [...this.appointments, ...this.mobileRequests].filter((appointment) =>
      this.isRenderableAppointment(appointment),
    );
  }

  private resolveProviderId(appointment: any): number | null {
    return this.normalizeId(
      appointment?.providerId ??
        appointment?.clinicId ??
        appointment?.mobileId ??
        appointment?.mobileProfessionalId,
    );
  }

  private normalizeId(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;

    const id = Number(value);

    return Number.isNaN(id) ? null : id;
  }

  private isRenderableAppointment(appointment: any): boolean {
    const petId = this.normalizeId(appointment?.petId);
    const providerId = this.resolveProviderId(appointment);
    const dateTime = appointment?.dateTime;
    const serviceTitle = this.getServiceTitle(appointment);

    if (!petId || !providerId || !dateTime) return false;
    if (this.isPlaceholderText(serviceTitle)) return false;

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) return false;
    if (!this.pets.some((pet) => Number(pet.id) === Number(petId))) return false;

    const providerType = this.normalizeProviderType(appointment?.providerType);

    return providerType === 'clinic' || providerType === 'mobile';
  }

  private isPlaceholderText(value: string | null | undefined): boolean {
    const text = String(value || '').trim().toLowerCase();
    const placeholderValues = ['pe', 'de', 'bu', 'ca', 'sc', 'string'];

    return text.length < 3 || placeholderValues.includes(text);
  }

  private normalizeProviderType(type: string | null | undefined): string {
    const normalizedType = (type || '').toLowerCase();

    if (normalizedType.includes('clinic')) return 'clinic';
    if (normalizedType.includes('mobile')) return 'mobile';

    return 'provider';
  }

  private resolveProviderName(provider: any): string {
    return (
      provider?.name ||
      provider?.clinicName ||
      provider?.fullName ||
      provider?.businessName ||
      provider?.displayName ||
      ''
    );
  }

  private registerProvider(provider: any): void {
    const id = this.normalizeId(provider.id);
    const type = this.normalizeProviderType(provider.type);
    const name = this.resolveProviderName(provider);

    if (!id || !name) return;

    this.providersMap.set(`${type}:${id}`, name);
    this.providersMap.set(`${id}`, name);
  }

  private loadMobileServices(): void {
    this.http
      .get<any[]>(`${environment.platformProviderApiBaseUrl}/mobile-services`)
      .pipe(catchError(() => of([] as any[])))
      .subscribe((services) => {
        (services || []).forEach((service) => {
          const id = this.normalizeId(service?.id);
          const name = service?.name || service?.serviceName || service?.title;

          if (!id || !name) return;

          this.mobileServicesMap.set(id, name);
        });

        this.mobileRequests = this.mobileRequests.map((request) => ({
          ...request,
          serviceType: this.resolveMobileServiceName(request.serviceId),
        }));
      });
  }

  private loadMobileRequests(): void {
    const ownerId = this.resolveOwnerId();

    if (!ownerId) return;

    this.http
      .get<any[]>(`${environment.platformProviderApiBaseUrl}/mobile-requests?ownerId=${ownerId}`)
      .pipe(
        catchError(() =>
          this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}/mobile-requests`).pipe(
            map((requests) =>
              (requests || []).filter((request) => Number(request?.ownerId) === Number(ownerId)),
            ),
            catchError(() => of([] as any[])),
          ),
        ),
      )
      .subscribe((requests) => {
        this.mobileRequests = (requests || []).map((request) => this.mapMobileRequest(request));
      });
  }

  private mapMobileRequest(request: any): any {
    const requestId = Number(request?.id);
    const mobileId = Number(request?.mobileId || request?.providerId || 0);
    const status = this.normalizeMobileRequestStatus(request?.status);

    return {
      id: `mobile-${requestId}`,
      requestId,
      source: 'mobile-request',
      petId: request?.petId,
      providerId: mobileId,
      mobileId,
      providerType: 'mobile',
      serviceId: request?.serviceId,
      serviceType: this.resolveMobileServiceName(request?.serviceId),
      dateTime: request?.scheduledDateTime || request?.dateTime || request?.date,
      status,
      notes: request?.notes,
      address: request?.address,
    };
  }

  private resolveMobileServiceName(serviceId: number | string | null | undefined): string {
    const id = this.normalizeId(serviceId);

    if (!id) return 'Servicio móvil';

    return this.mobileServicesMap.get(id) || `Servicio móvil #${id}`;
  }

  private normalizeMobileRequestStatus(status: string | null | undefined): string {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    if (!normalizedStatus) return 'pending';
    if (normalizedStatus === 'rejected') return 'cancelled';
    if (normalizedStatus === 'confirmed' || normalizedStatus === 'in_process') return 'accepted';

    return normalizedStatus;
  }

  private cancelMobileRequest(requestId: number): void {
    if (!requestId || !confirm('¿Cancelar esta solicitud móvil?')) return;

    this.http
      .patch(`${environment.platformProviderApiBaseUrl}/mobile-requests/${requestId}/cancel`, {})
      .subscribe({
        next: () => {
          this.mobileRequests = this.mobileRequests.map((request) =>
            request.requestId === requestId ? { ...request, status: 'cancelled' } : request,
          );
          this.notification.success('Solicitud móvil cancelada');
        },
        error: (error) => {
          console.error('Error cancelling mobile request', error);
          this.notification.error('Error al cancelar solicitud móvil');
        },
      });
  }

  private resolveOwnerId(): number | null {
    const currentUserId = this.iamStore.currentUserId();

    if (currentUserId) return Number(currentUserId);

    const localStorageKeys = ['userId', 'currentUserId', 'id'];

    for (const key of localStorageKeys) {
      const value = Number(localStorage.getItem(key));

      if (!Number.isNaN(value) && value > 0) return value;
    }

    return null;
  }
}
