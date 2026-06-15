import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MobileAppointment {
  id?: number;
  mobileId: number;
  ownerId: number;
  petId: number;
  serviceName: string;
  scheduledDateTime: string;
  address: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class MobileAppointmentApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/mobile-appointments`;

  getByMobileId(mobileId: number): Observable<MobileAppointment[]> {
    return this.http.get<MobileAppointment[]>(`${this.baseUrl}?mobileId=${mobileId}`);
  }

  getById(id: number): Observable<MobileAppointment> {
    return this.http.get<MobileAppointment>(`${this.baseUrl}/${id}`);
  }

  create(appointment: Omit<MobileAppointment, 'id'>): Observable<MobileAppointment> {
    return this.http.post<MobileAppointment>(this.baseUrl, appointment);
  }

  update(id: number, data: Partial<MobileAppointment>): Observable<MobileAppointment> {
    return this.http.put<MobileAppointment>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
