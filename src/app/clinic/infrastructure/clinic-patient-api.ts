import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClinicPatient {
  id: number; // petId
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  ownerId: number;
  ownerName?: string;
  ownerPhone?: string;
  allergies?: string;
  photoUrl?: string;
  lastVisit?: string; // fecha de la última cita en esta clínica
}

@Injectable({ providedIn: 'root' })
export class ClinicPatientApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/patients`;

  /** Obtener pacientes de una clínica (mascotas que han tenido citas) */
  getByClinic(clinicId: number): Observable<ClinicPatient[]> {
    return this.http.get<ClinicPatient[]>(`${this.baseUrl}?clinicId=${clinicId}`);
  }

  /** Obtener detalle de un paciente por su ID (petId) */
  getById(petId: number): Observable<ClinicPatient> {
    return this.http.get<ClinicPatient>(`${this.baseUrl}/${petId}`);
  }
}
