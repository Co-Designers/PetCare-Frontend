import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClinicProfile {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  ruc?: string;
  clinicType?: string;
  description?: string;
  logoUrl?: string;
  openingHours?: string;
  servicesOffered?: string[];
  specialties?: string[];
  rating?: number;
}

@Injectable({ providedIn: 'root' })
export class ClinicClinicApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/clinics`;

  /** Obtener perfil de la clínica por ID */
  getById(id: number): Observable<ClinicProfile> {
    return this.http.get<ClinicProfile>(`${this.baseUrl}/${id}`);
  }

  /** Obtener clínicas disponibles */
  getAll(): Observable<ClinicProfile[]> {
    return this.http.get<ClinicProfile[]>(this.baseUrl);
  }

  /** Actualizar perfil de la clínica */
  update(id: number, data: Partial<ClinicProfile>): Observable<ClinicProfile> {
    return this.http.patch<ClinicProfile>(`${this.baseUrl}/${id}`, data);
  }
}
