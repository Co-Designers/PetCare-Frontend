import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { OwnerAppointmentService } from '../../../application/owner-appointment';
import { OwnerPetService } from '../../../application/owner-pet';
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

  private readonly providersMap = new Map<string, string>();

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
    return this.appointments.filter((appointment) => this.isUpcoming(appointment.dateTime));
  }

  get pastAppointments() {
    return this.appointments.filter((appointment) => !this.isUpcoming(appointment.dateTime));
  }

  ngOnInit(): void {
    this.appointmentService.loadAppointments();
    this.petService.loadPets();
    this.loadProviders();
  }

  loadProviders(): void {
    this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}/service-providers`).subscribe({
      next: (providers) => {
        providers.forEach((provider) => {
          const id = this.normalizeId(provider.id);
          const type = this.normalizeProviderType(provider.type);
          const name = this.resolveProviderName(provider);

          if (!id || !name) return;

          this.providersMap.set(`${type}:${id}`, name);
          this.providersMap.set(`${id}`, name);
        });
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
      completed: 'Completada',
      accepted: 'Aceptada',
    };

    return labels[normalizedStatus] || status || 'Sin estado';
  }

  getStatusClass(status: string | null | undefined): string {
    const normalizedStatus = (status || '').toLowerCase();

    if (normalizedStatus === 'confirmed' || normalizedStatus === 'accepted') {
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

  isUpcoming(dateTime: string): boolean {
    if (!dateTime) return false;

    return new Date(dateTime) >= new Date();
  }

  cancelAppointment(id: number): void {
    if (confirm('¿Cancelar esta cita?')) {
      this.appointmentService.cancelAppointment(id);
    }
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
}
