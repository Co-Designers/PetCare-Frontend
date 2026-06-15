import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OwnerMedicalRecordEntity } from '../domain/model/owner-medical-record-entity';

@Injectable({ providedIn: 'root' })
export class OwnerMedicalRecordApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/medical-records`;

  /** Obtener historial médico por mascota (petId) */
  getByPet(petId: number): Observable<OwnerMedicalRecordEntity[]> {
    return this.http.get<OwnerMedicalRecordEntity[]>(`${this.baseUrl}?petId=${petId}`);
  }

  /** Crear un nuevo registro médico (generalmente usado por clínicas, pero se deja para completitud) */
  create(record: Omit<OwnerMedicalRecordEntity, 'id'>): Observable<OwnerMedicalRecordEntity> {
    return this.http.post<OwnerMedicalRecordEntity>(this.baseUrl, record);
  }
}
