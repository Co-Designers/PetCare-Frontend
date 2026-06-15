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
  private appointmentService = inject(OwnerAppointmentService);
  private petService = inject(OwnerPetService);
  private http = inject(HttpClient);

  get appointments() {
    return this.appointmentService.appointments();
  }
  get loading() {
    return this.appointmentService.loading();
  }
  get pets() {
    return this.petService.pets();
  }

  private providersMap = new Map<number, string>();

  ngOnInit(): void {
    this.appointmentService.loadAppointments();
    this.petService.loadPets();
    this.loadProviders();
  }

  loadProviders(): void {
    // Llamada directa al endpoint de service-providers
    this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}/service-providers`).subscribe({
      next: (providers) => {
        providers.forEach((p) => this.providersMap.set(p.id, p.name));
      },
      error: (err) => console.error('Error loading providers', err),
    });
  }

  getPetName(petId: number): string {
    return this.pets.find((p) => p.id === petId)?.name || 'Mascota';
  }

  getProviderName(providerId: number): string {
    return this.providersMap.get(providerId) || `ID: ${providerId}`;
  }

  isUpcoming(dateTime: string): boolean {
    return new Date(dateTime) >= new Date();
  }

  cancelAppointment(id: number): void {
    if (confirm('¿Cancelar esta cita?')) {
      this.appointmentService.cancelAppointment(id);
    }
  }
}
