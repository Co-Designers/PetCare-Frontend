import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OwnerAppointmentEntity } from '../domain/model/owner-appointment-entity';

@Injectable({ providedIn: 'root' })
export class OwnerAppointmentApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/appointments`;

  /** Obtener todas las citas de un dueño (ownerId) */
  getByOwner(ownerId: number): Observable<OwnerAppointmentEntity[]> {
    return this.http.get<OwnerAppointmentEntity[]>(`${this.baseUrl}?ownerId=${ownerId}`);
  }

  /** Obtener una cita por ID */
  getById(id: number): Observable<OwnerAppointmentEntity> {
    return this.http.get<OwnerAppointmentEntity>(`${this.baseUrl}/${id}`);
  }

  /** Crear una nueva cita */
  create(appointment: Omit<OwnerAppointmentEntity, 'id'>): Observable<OwnerAppointmentEntity> {
    return this.http.post<OwnerAppointmentEntity>(this.baseUrl, appointment);
  }

  /** Actualizar una cita */
  update(id: number, updates: Partial<OwnerAppointmentEntity>): Observable<OwnerAppointmentEntity> {
    return this.http.put<OwnerAppointmentEntity>(`${this.baseUrl}/${id}`, updates);
  }

  /** Eliminar (cancelar) una cita */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
