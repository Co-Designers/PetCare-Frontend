import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable, inject, signal } from '@angular/core';
import { ClinicPatientApiService, ClinicPatient } from '../infrastructure/clinic-patient-api';
import { IamStore } from '../../iam/application/iam-store';
import { NotificationService } from '../../shared/application/notification';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

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
    forkJoin({
      patients: this.api.getByClinic(clinicId).pipe(catchError(() => of([] as ClinicPatient[]))),
      appointments: this.http
        .get<any[]>(`${this.baseUrl}/appointments?clinicId=${clinicId}`)
        .pipe(catchError(() => of([] as any[]))),
      pets: this.http.get<any[]>(`${this.baseUrl}/pets`).pipe(catchError(() => of([] as any[]))),
    }).subscribe({
      next: ({ patients, appointments, pets }) => {
        const mergedPatients = this.mergePatientsFromAppointments(patients, appointments, pets);

        this.patientsSignal.set(mergedPatients);
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
    this.http
      .get<any[]>(`${this.baseUrl}/medical-records`)
      .pipe(
        map((records) =>
          (records || []).filter((record) => Number(record?.petId) === Number(petId)),
        ),
        catchError(() => of([] as any[])),
      )
      .subscribe({
      next: (records) => {
        this.recordsSignal.set(records);
        this.loadingRecords.set(false);
      },
      error: () => {
        this.recordsSignal.set([]);
        this.loadingRecords.set(false);
      },
    });
  }

  private mergePatientsFromAppointments(
    patients: ClinicPatient[],
    appointments: any[],
    pets: any[],
  ): ClinicPatient[] {
    const merged = new Map<number, ClinicPatient>();

    (patients || []).forEach((patient) => {
      if (!patient?.id) return;
      merged.set(Number(patient.id), patient);
    });

    const clinicalStatuses = ['confirmed', 'completed', 'in_process'];

    (appointments || []).forEach((appointment) => {
      const status = String(appointment?.status || '').toLowerCase();
      const petId = Number(appointment?.petId);

      if (!petId || !clinicalStatuses.includes(status)) return;

      const pet = (pets || []).find((item) => Number(item?.id) === petId);
      const existing = merged.get(petId);
      const patient: ClinicPatient = {
        id: petId,
        name: existing?.name || pet?.name || `Mascota #${petId}`,
        species: existing?.species || pet?.species || 'Mascota',
        breed: existing?.breed || pet?.breed || '',
        birthDate: existing?.birthDate || pet?.birthDate,
        weight: existing?.weight ?? pet?.weight,
        ownerId: Number(existing?.ownerId || appointment?.ownerId || pet?.ownerId || 0),
        ownerName: existing?.ownerName || appointment?.ownerName || pet?.ownerName,
        ownerPhone: existing?.ownerPhone || appointment?.ownerPhone || pet?.ownerPhone,
        allergies: existing?.allergies || pet?.allergies || 'Sin alergias registradas',
        photoUrl: existing?.photoUrl || pet?.photoUrl,
        lastVisit: this.resolveLatestVisit(existing?.lastVisit, appointment?.dateTime),
      };

      merged.set(petId, patient);
    });

    return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  private resolveLatestVisit(current: string | undefined, incoming: string | undefined): string | undefined {
    if (!current) return incoming;
    if (!incoming) return current;

    return new Date(incoming).getTime() > new Date(current).getTime() ? incoming : current;
  }
}
