import { Injectable, inject, signal } from '@angular/core';
import { IamStore } from '../../iam/application/iam-store';
import { OwnerPetApiService } from '../infrastructure/owner-pet-api';
import { OwnerPetEntity } from '../domain/model/owner-pet-entity';
import { NotificationService } from '../../shared/application/notification';

@Injectable({ providedIn: 'root' })
export class OwnerPetService {
  private api = inject(OwnerPetApiService);
  private iamStore = inject(IamStore);
  private notification = inject(NotificationService);

  private petsSignal = signal<OwnerPetEntity[]>([]);
  public readonly pets = this.petsSignal.asReadonly();
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  /** Cargar todas las mascotas del dueño autenticado */
  loadPets(): void {
    const ownerId = this.iamStore.currentUserId();
    if (!ownerId) return;
    this.loading.set(true);
    this.api.getByOwner(ownerId).subscribe({
      next: (pets) => {
        this.petsSignal.set(pets);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error loading pets');
        this.loading.set(false);
        this.notification.error('Error al cargar mascotas');
      },
    });
  }

  /** Agregar una nueva mascota */
  addPet(pet: Omit<OwnerPetEntity, 'id'>): void {
    const ownerId = this.iamStore.currentUserId();
    if (!ownerId) return;
    const newPet = { ...pet, ownerId };
    this.api.create(newPet).subscribe({
      next: (created) => {
        this.petsSignal.update((list) => [...list, created]);
        this.notification.success('Mascota agregada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error creating pet');
        this.notification.error('Error al agregar mascota');
      },
    });
  }

  /** Actualizar una mascota existente */
  updatePet(id: number, data: Partial<OwnerPetEntity>): void {
    this.api.update(id, data).subscribe({
      next: (updated) => {
        this.petsSignal.update((list) => list.map((p) => (p.id === id ? updated : p)));
        this.notification.success('Mascota actualizada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error updating pet');
        this.notification.error('Error al actualizar mascota');
      },
    });
  }

  /** Eliminar una mascota */
  deletePet(id: number): void {
    this.api.delete(id).subscribe({
      next: () => {
        this.petsSignal.update((list) => list.filter((p) => p.id !== id));
        this.notification.success('Mascota eliminada');
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error deleting pet');
        this.notification.error('Error al eliminar mascota');
      },
    });
  }
}
