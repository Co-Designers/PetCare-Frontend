import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable, inject, signal } from '@angular/core';
import { ClinicPatientApiService, ClinicPatient } from '../infrastructure/clinic-patient-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClinicPatientService {
  private api = inject(ClinicPatientApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);
  private http = inject(HttpClient);
  private baseUrl = environment.platformProviderApiBaseUrl;
  private patientsSignal = signal<ClinicPatient[]>([]);
  public readonly patients = this.patientsSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  loadPatients(): void {
    const clinicId = this.iamStore.currentUserId();
    if (clinicId === null || clinicId === undefined) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.api.getByClinic(clinicId).subscribe({
      next: (patients) => {
        this.patientsSignal.set(patients);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error loading patients');
        this.loading.set(false);
        this.notification.error('Error al cargar pacientes');
      },
    });
  }
  //historial médico
  private recordsSignal = signal<any[]>([]);
  public readonly medicalRecords = this.recordsSignal.asReadonly();
  public readonly loadingRecords = signal<boolean>(false);

  getPatientById(petId: number): Observable<ClinicPatient> {
    return this.api.getById(petId);
  }
  loadMedicalRecords(petId: number): void {
    this.loadingRecords.set(true);
    this.http.get<any[]>(`${this.baseUrl}/medical-records?petId=${petId}`).subscribe({
      next: (records) => {
        this.recordsSignal.set(records);
        this.loadingRecords.set(false);
      },
      error: () => {
        this.recordsSignal.set([]);
        this.loadingRecords.set(false);
        this.notification.error('Error al cargar historial médico');
      },
    });
  }
}
