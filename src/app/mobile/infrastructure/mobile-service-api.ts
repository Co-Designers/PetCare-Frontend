import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MobileService {
  id?: number;
  mobileId: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MobileServiceApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/mobile-services`;

  getByMobileId(mobileId: number): Observable<MobileService[]> {
    return this.http.get<MobileService[]>(`${this.baseUrl}?mobileId=${mobileId}`);
  }

  getById(id: number): Observable<MobileService> {
    return this.http.get<MobileService>(`${this.baseUrl}/${id}`);
  }

  create(service: Omit<MobileService, 'id'>): Observable<MobileService> {
    return this.http.post<MobileService>(this.baseUrl, service);
  }

  update(id: number, data: Partial<MobileService>): Observable<MobileService> {
    return this.http.put<MobileService>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
