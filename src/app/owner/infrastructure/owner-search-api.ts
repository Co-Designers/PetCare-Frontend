import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OwnerServiceProviderEntity } from '../domain/model/owner-service-provider-entity';

@Injectable({ providedIn: 'root' })
export class OwnerSearchApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.platformProviderApiBaseUrl;

  /** Buscar proveedores (clínicas y profesionales móviles) con filtros opcionales */
  search(filters: {
    district?: string;
    specialty?: string;
    type?: 'clinic' | 'mobile';
  }): Observable<OwnerServiceProviderEntity[]> {
    const clinics$ =
      filters.type === 'mobile'
        ? of([] as OwnerServiceProviderEntity[])
        : this.http.get<any[]>(`${this.baseUrl}/clinics`).pipe(
            map((clinics) => clinics.map((clinic) => this.mapClinic(clinic))),
            catchError(() => of([] as OwnerServiceProviderEntity[])),
          );

    const mobileProfessionals$ =
      filters.type === 'clinic'
        ? of([] as OwnerServiceProviderEntity[])
        : this.http.get<any[]>(`${this.baseUrl}/mobile-professionals`).pipe(
            map((professionals) => professionals.map((professional) => this.mapMobile(professional))),
            catchError(() => of([] as OwnerServiceProviderEntity[])),
          );

    return forkJoin([clinics$, mobileProfessionals$]).pipe(
      map(([clinics, mobileProfessionals]) => {
        const providers =
          clinics.length || mobileProfessionals.length
            ? [...clinics, ...mobileProfessionals]
            : this.getFallbackProviders();

        const filtered = providers.filter((provider) =>
          this.matchesFilters(provider, filters),
        );

        return filtered.length > 0
          ? filtered
          : this.getFallbackProviders().filter((provider) => this.matchesFilters(provider, filters));
      }),
    );
  }

  private mapClinic(clinic: any): OwnerServiceProviderEntity {
    return {
      id: Number(clinic.id),
      type: 'clinic',
      name: clinic.name || clinic.clinicName || 'Clínica veterinaria',
      email: clinic.email || '',
      phone: clinic.phone || '',
      address: clinic.address || '',
      district: clinic.district || '',
      specialties: clinic.specialties || [],
      servicesOffered: clinic.servicesOffered || clinic.services || [],
      rating: Number(clinic.rating || 0),
      openingHours: clinic.openingHours || '',
    };
  }

  private mapMobile(professional: any): OwnerServiceProviderEntity {
    const coverageDistricts = professional.coverageDistricts || [];

    return {
      id: Number(professional.id),
      type: 'mobile',
      name: professional.name || professional.fullName || 'Profesional móvil',
      email: professional.email || '',
      phone: professional.phone || '',
      district: professional.district || coverageDistricts[0] || '',
      specialties: professional.specialty ? [professional.specialty] : [],
      servicesOffered: professional.servicesOffered || [],
      rating: Number(professional.rating || 0),
      mobileSubtype: professional.mobileSubtype || 'vet',
      coverageDistricts,
      hasVehicle: professional.hasVehicle !== false,
      vehiclePlate: professional.vehiclePlate || '',
    };
  }

  private matchesFilters(
    provider: OwnerServiceProviderEntity,
    filters: { district?: string; specialty?: string; type?: 'clinic' | 'mobile' },
  ): boolean {
    const district = (filters.district || '').trim().toLowerCase();
    const specialty = (filters.specialty || '').trim().toLowerCase();
    const type = (filters.type || '').trim().toLowerCase();

    const providerDistricts = [
      provider.district,
      ...(provider.coverageDistricts || []),
    ]
      .filter(Boolean)
      .map((value) => value.toLowerCase());

    const providerSpecialties = [
      ...(provider.specialties || []),
      ...(provider.servicesOffered || []),
    ]
      .filter(Boolean)
      .map((value) => value.toLowerCase());

    const matchesDistrict = !district || providerDistricts.some((value) => value.includes(district));
    const matchesSpecialty =
      !specialty || providerSpecialties.some((value) => value.includes(specialty));
    const matchesType = !type || provider.type === type;

    return matchesType && matchesDistrict && matchesSpecialty;
  }

  private getFallbackProviders(): OwnerServiceProviderEntity[] {
    return [
      {
        id: 1,
        type: 'clinic',
        name: 'Veterinaria San Martín',
        email: 'clinic@petcare.com',
        phone: '987654321',
        address: 'Av. Principal 123',
        district: 'Miraflores',
        specialties: ['Medicina general', 'Vacunación', 'Control preventivo'],
        servicesOffered: ['Consulta general', 'Vacunación', 'Control preventivo'],
        rating: 4.8,
        openingHours: 'Lunes a sábado, 09:00 - 18:00',
      },
      {
        id: 1,
        type: 'mobile',
        name: 'Dra. Valeria Ramos',
        email: 'valeria.mobile@petcare.com',
        phone: '988777666',
        district: 'Miraflores',
        specialties: ['Urgencias y atención a domicilio'],
        servicesOffered: ['Consulta a domicilio', 'Vacunación a domicilio'],
        rating: 4.9,
        mobileSubtype: 'vet',
        coverageDistricts: ['Miraflores', 'San Isidro', 'Surco'],
        hasVehicle: true,
        vehiclePlate: 'PET-321',
      },
    ];
  }
}
