import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MobileRequest {
  id?: number;
  mobileId: number;
  ownerId: number;
  petId: number;
  serviceId: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  scheduledDateTime?: string;
  address: string;
  notes?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class MobileRequestApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/mobile-requests`;

  getByMobileId(mobileId: number): Observable<MobileRequest[]> {
    return this.http.get<MobileRequest[]>(`${this.baseUrl}?mobileId=${mobileId}`);
  }

  getById(id: number): Observable<MobileRequest> {
    return this.http.get<MobileRequest>(`${this.baseUrl}/${id}`);
  }

  create(request: Omit<MobileRequest, 'id'>): Observable<MobileRequest> {
    return this.http.post<MobileRequest>(this.baseUrl, request);
  }

  update(id: number, data: Partial<MobileRequest>): Observable<MobileRequest> {
    return this.http.put<MobileRequest>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
