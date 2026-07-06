import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MobileProfessional {
  id?: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  mobileSubtype: 'vet' | 'groomer' | 'diagnostic_tech';
  coverageDistricts: string[];
  hasVehicle: boolean;
  vehiclePlate?: string;
  specialty?: string;
  rating?: number;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MobileProfessionalApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/mobile-professionals`;

  getByUserId(userId: number): Observable<MobileProfessional[]> {
    return this.http.get<MobileProfessional[]>(`${this.baseUrl}?userId=${userId}`);
  }

  getAll(): Observable<MobileProfessional[]> {
    return this.http.get<MobileProfessional[]>(this.baseUrl);
  }

  getById(id: number): Observable<MobileProfessional> {
    return this.http.get<MobileProfessional>(`${this.baseUrl}/${id}`);
  }

  create(professional: Omit<MobileProfessional, 'id'>): Observable<MobileProfessional> {
    return this.http.post<MobileProfessional>(this.baseUrl, professional);
  }

  update(id: number, data: Partial<MobileProfessional>): Observable<MobileProfessional> {
    return this.http.put<MobileProfessional>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
