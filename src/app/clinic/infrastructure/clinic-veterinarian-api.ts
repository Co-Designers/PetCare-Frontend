import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClinicVeterinarian {
  id?: number;
  clinicId: number;
  name: string;
  specialty: string;
  licenseNumber: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  isActive?: boolean;
  schedule?: string;
}

@Injectable({ providedIn: 'root' })
export class ClinicVeterinarianApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/veterinarians`;

  /** Obtener veterinarios de una clínica */
  getByClinic(clinicId: number): Observable<ClinicVeterinarian[]> {
    return this.http.get<ClinicVeterinarian[]>(`${this.baseUrl}?clinicId=${clinicId}`);
  }

  /** Obtener un veterinario por ID */
  getById(id: number): Observable<ClinicVeterinarian> {
    return this.http.get<ClinicVeterinarian>(`${this.baseUrl}/${id}`);
  }

  /** Crear nuevo veterinario */
  create(vet: Omit<ClinicVeterinarian, 'id'>): Observable<ClinicVeterinarian> {
    return this.http.post<ClinicVeterinarian>(this.baseUrl, vet);
  }

  /** Actualizar veterinario */
  update(id: number, data: Partial<ClinicVeterinarian>): Observable<ClinicVeterinarian> {
    return this.http.put<ClinicVeterinarian>(`${this.baseUrl}/${id}`, data);
  }

  /** Eliminar veterinario */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
