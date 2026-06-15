import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClinicService {
  id?: number;
  clinicId: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ClinicServiceApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/services`;

  /** Obtener servicios de una clínica */
  getByClinic(clinicId: number): Observable<ClinicService[]> {
    return this.http.get<ClinicService[]>(`${this.baseUrl}?clinicId=${clinicId}`);
  }

  /** Obtener un servicio por ID */
  getById(id: number): Observable<ClinicService> {
    return this.http.get<ClinicService>(`${this.baseUrl}/${id}`);
  }

  /** Crear nuevo servicio */
  create(service: Omit<ClinicService, 'id'>): Observable<ClinicService> {
    return this.http.post<ClinicService>(this.baseUrl, service);
  }

  /** Actualizar servicio */
  update(id: number, data: Partial<ClinicService>): Observable<ClinicService> {
    return this.http.put<ClinicService>(`${this.baseUrl}/${id}`, data);
  }

  /** Eliminar servicio */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
