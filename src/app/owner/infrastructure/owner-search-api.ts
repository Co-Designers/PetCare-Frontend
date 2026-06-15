import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OwnerServiceProviderEntity } from '../domain/model/owner-service-provider-entity';

@Injectable({ providedIn: 'root' })
export class OwnerSearchApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/service-providers`;

  /** Buscar proveedores (clínicas y profesionales móviles) con filtros opcionales */
  search(filters: {
    district?: string;
    specialty?: string;
    type?: 'clinic' | 'mobile';
  }): Observable<OwnerServiceProviderEntity[]> {
    let url = this.baseUrl;
    const params = new URLSearchParams();
    if (filters.district) params.set('district', filters.district);
    if (filters.specialty) params.set('specialty', filters.specialty);
    if (filters.type) params.set('type', filters.type);
    const query = params.toString();
    if (query) url += `?${query}`;
    return this.http.get<OwnerServiceProviderEntity[]>(url);
  }
}
