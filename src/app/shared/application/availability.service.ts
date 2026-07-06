import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private http = inject(HttpClient);
  private baseUrl = environment.platformProviderApiBaseUrl;

  getClinicSlots(clinicId: number, date: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(
      `${this.baseUrl}/appointments/available-slots?clinicId=${clinicId}&date=${date}`,
    );
  }

  getMobileSlots(mobileId: number, date: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(
      `${this.baseUrl}/mobile-requests/available-slots?mobileId=${mobileId}&date=${date}`,
    );
  }
}
