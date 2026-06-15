import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OwnerUserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  district: string;
}

@Injectable({ providedIn: 'root' })
export class OwnerUserProfileApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.platformProviderApiBaseUrl}/users`;

  /** Obtener perfil del usuario por ID */
  get(userId: number): Observable<OwnerUserProfile> {
    return this.http.get<OwnerUserProfile>(`${this.baseUrl}/${userId}`);
  }

  /** Actualizar perfil del usuario */
  update(userId: number, data: Partial<OwnerUserProfile>): Observable<OwnerUserProfile> {
    return this.http.patch<OwnerUserProfile>(`${this.baseUrl}/${userId}`, data);
  }

  /** Cambiar contraseña */
  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/change-password`, {
      userId,
      currentPassword,
      newPassword
    });
  }
}
