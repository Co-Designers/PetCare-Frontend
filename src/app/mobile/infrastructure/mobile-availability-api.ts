import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TimeSlot {
  id?: number;
  mobileId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isAvailable: boolean;
}

@Injectable({ providedIn: 'root' })
export class MobileAvailabilityApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/mobile-availability`;

  getByMobileId(mobileId: number, date?: string): Observable<TimeSlot[]> {
    let url = `${this.baseUrl}?mobileId=${mobileId}`;
    if (date) url += `&date=${date}`;
    return this.http.get<TimeSlot[]>(url);
  }

  getById(id: number): Observable<TimeSlot> {
    return this.http.get<TimeSlot>(`${this.baseUrl}/${id}`);
  }

  create(slot: Omit<TimeSlot, 'id'>): Observable<TimeSlot> {
    return this.http.post<TimeSlot>(this.baseUrl, slot);
  }

  update(id: number, data: Partial<TimeSlot>): Observable<TimeSlot> {
    return this.http.put<TimeSlot>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
