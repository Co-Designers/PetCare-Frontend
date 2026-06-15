import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClinicAppointment {
  id?: number;
  petId: number;
  clinicId: number;
  veterinarianId?: number;
  serviceType: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  notes?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ClinicAppointmentApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/appointments`;

  /** Obtener todas las citas de una clínica (filtradas por clinicId) */
  getByClinic(clinicId: number): Observable<ClinicAppointment[]> {
    ClinicAppointmentApiService;
    return this.http.get<ClinicAppointment[]>(`${this.baseUrl}?clinicId=${clinicId}`);
  }

  /** Obtener una cita por ID */
  getById(id: number): Observable<ClinicAppointment> {
    return this.http.get<ClinicAppointment>(`${this.baseUrl}/${id}`);
  }

  /** Actualizar una cita (cambiar estado, notas, etc.) */
  update(id: number, updates: Partial<ClinicAppointment>): Observable<ClinicAppointment> {
    return this.http.put<ClinicAppointment>(`${this.baseUrl}/${id}`, updates);
  }
  create(appointment: Omit<ClinicAppointment, 'id'>): Observable<ClinicAppointment> {
    return this.http.post<ClinicAppointment>(this.baseUrl, appointment);
  }
}
