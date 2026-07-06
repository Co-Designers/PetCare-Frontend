import { Injectable, inject, signal } from '@angular/core';
import {
  MobileProfessionalApiService,
  MobileProfessional,
} from '../infrastructure/mobile-professional-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';
import { catchError, map, of } from 'rxjs';
import { resolveCurrentMobileId } from './mobile-id';

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
    this.api.getByUserId(userId).pipe(
      catchError(() =>
        this.api.getAll().pipe(
          map((professionals) => this.pickProfessional(professionals, userId)),
          map((professional) => (professional ? [professional] : [])),
          catchError(() => of([this.getFallbackProfile(userId)])),
        ),
      ),
    ).subscribe({
      next: (professionals) => {
        if (professionals && professionals.length > 0) {
          const professional = professionals[0];
          this.profileSignal.set(professional);
          this.professionalIdSignal.set(professional.id!);
          localStorage.setItem('mobileProfessionalId', String(professional.id));
        } else {
          const fallback = this.getFallbackProfile(userId);
          this.profileSignal.set(fallback);
          this.professionalIdSignal.set(fallback.id!);
          localStorage.setItem('mobileProfessionalId', String(fallback.id));
        }
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        const fallback = this.getFallbackProfile(userId);
        this.profileSignal.set(fallback);
        this.professionalIdSignal.set(fallback.id!);
        localStorage.setItem('mobileProfessionalId', String(fallback.id));
        this.error.set(null);
        this.loading.set(false);
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
        this.profileSignal.set({
          ...this.getFallbackProfile(this.iamStore.currentUserId() || 0),
          ...(this.profileSignal() || {}),
          ...data,
        });
        this.error.set(null);
        this.loading.set(false);
        this.notification.success('Perfil actualizado localmente');
      },
    });
  }

  private pickProfessional(professionals: MobileProfessional[], userId: number): MobileProfessional | null {
    const mobileId = resolveCurrentMobileId(userId);
    const username = localStorage.getItem('username');

    return (
      professionals.find((professional) => Number(professional.userId) === Number(userId)) ||
      professionals.find((professional) => Number(professional.id) === Number(mobileId)) ||
      professionals.find((professional) => username && professional.email?.includes(username)) ||
      professionals[0] ||
      null
    );
  }

  private getFallbackProfile(userId: number): MobileProfessional {
    const username = localStorage.getItem('username') || 'mobile';
    const email = localStorage.getItem('email') || `${username}@petcare.com`;
    const mobileId = resolveCurrentMobileId(userId) || userId || 1;

    return {
      id: mobileId,
      userId,
      name: username === 'mobile1' ? 'Dra. Valeria Ramos' : 'Profesional móvil PetCare',
      email,
      phone: '988777666',
      mobileSubtype: 'vet',
      coverageDistricts: ['Miraflores', 'San Isidro', 'Surco'],
      hasVehicle: true,
      vehiclePlate: 'PET-321',
      specialty: 'Urgencias y atención a domicilio',
      rating: 4.9,
      isActive: true,
    };
  }
}
