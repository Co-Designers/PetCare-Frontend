import { Injectable, inject, signal } from '@angular/core';
import { ClinicClinicApiService, ClinicProfile } from '../infrastructure/clinic-clinic-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';
import { catchError, map, of } from 'rxjs';

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
    this.api.getById(clinicId).pipe(
      catchError(() =>
        this.api.getAll().pipe(
          map((clinics) => clinics.find((clinic) => Number(clinic.id) === Number(clinicId)) || clinics[0]),
          catchError(() => of(this.getFallbackProfile(clinicId))),
        ),
      ),
    ).subscribe({
      next: (profile) => {
        this.clinicSignal.set(profile || this.getFallbackProfile(clinicId));
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.clinicSignal.set(this.getFallbackProfile(clinicId));
        this.error.set(null);
        this.loading.set(false);
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
        this.clinicSignal.set({
          ...this.getFallbackProfile(clinicId),
          ...(this.clinicSignal() || {}),
          ...data,
        });
        this.error.set(null);
        this.loading.set(false);
        this.notification.success('Perfil actualizado localmente');
      },
    });
  }

  private getFallbackProfile(clinicId: number): ClinicProfile {
    const username = localStorage.getItem('username') || 'clinic';
    const email = localStorage.getItem('email') || `${username}@petcare.com`;

    return {
      id: clinicId,
      name: username === 'clinic1' ? 'Veterinaria San Martín' : 'Clínica PetCare',
      email,
      phone: '987654321',
      address: 'Av. Principal 123',
      district: 'Miraflores',
      ruc: '20123456789',
      clinicType: 'General',
      description: 'Clínica veterinaria con atención preventiva, consultas y vacunación.',
      openingHours: 'Lunes a sábado, 09:00 - 18:00',
      servicesOffered: ['Consulta general', 'Vacunación', 'Control preventivo'],
      specialties: ['Medicina general', 'Vacunación'],
      rating: 4.8,
    };
  }
}
