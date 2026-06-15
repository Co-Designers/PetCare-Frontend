import { Injectable, inject, signal } from '@angular/core';
import { OwnerMedicalRecordApiService } from '../infrastructure/owner-medical-record-api';
import { OwnerMedicalRecordEntity } from '../domain/model/owner-medical-record-entity';
import { NotificationService } from '../../shared/application/notification';

@Injectable({ providedIn: 'root' })
export class OwnerMedicalRecordService {
  private api = inject(OwnerMedicalRecordApiService);
  private notification = inject(NotificationService);

  private recordsSignal = signal<OwnerMedicalRecordEntity[]>([]);
  public readonly records = this.recordsSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  /** Cargar historial clínico de una mascota */
  loadRecords(petId: number): void {
    this.loading.set(true);
    this.api.getByPet(petId).subscribe({
      next: (records) => {
        this.recordsSignal.set(records);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error loading medical records');
        this.loading.set(false);
        this.notification.error('Error al cargar historial');
      },
    });
  }

  /** Agregar un nuevo registro médico (uso futuro) */
  addRecord(record: Omit<OwnerMedicalRecordEntity, 'id'>): void {
    this.api.create(record).subscribe({
      next: (created) => {
        this.recordsSignal.update((list) => [...list, created]);
        this.notification.success('Registro médico añadido');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error adding medical record');
        this.notification.error('Error al añadir registro');
      },
    });
  }
}
