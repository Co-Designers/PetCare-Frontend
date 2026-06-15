import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OwnerPetEntity } from '../domain/model/owner-pet-entity';

@Injectable({ providedIn: 'root' })
export class OwnerPetApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/pets`;

  /** Obtener todas las mascotas de un dueño (ownerId) */
  getByOwner(ownerId: number): Observable<OwnerPetEntity[]> {
    return this.http.get<OwnerPetEntity[]>(`${this.baseUrl}?ownerId=${ownerId}`);
  }

  /** Obtener una mascota por ID */
  getById(id: number): Observable<OwnerPetEntity> {
    return this.http.get<OwnerPetEntity>(`${this.baseUrl}/${id}`);
  }

  /** Crear una nueva mascota */
  create(pet: Omit<OwnerPetEntity, 'id'>): Observable<OwnerPetEntity> {
    return this.http.post<OwnerPetEntity>(this.baseUrl, pet);
  }

  /** Actualizar una mascota existente */
  update(id: number, pet: Partial<OwnerPetEntity>): Observable<OwnerPetEntity> {
    return this.http.put<OwnerPetEntity>(`${this.baseUrl}/${id}`, pet);
  }

  /** Eliminar una mascota */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
