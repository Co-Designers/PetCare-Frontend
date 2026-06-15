import { Injectable, inject, signal } from '@angular/core';
import { OwnerSearchApiService } from '../infrastructure/owner-search-api';
import { OwnerServiceProviderEntity } from '../domain/model/owner-service-provider-entity';
import { NotificationService } from '../../shared/application/notification';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OwnerSearchService {
  private api = inject(OwnerSearchApiService);
  private notification = inject(NotificationService);

  private resultsSignal = signal<OwnerServiceProviderEntity[]>([]);
  public readonly results = this.resultsSignal.asReadonly();
  public readonly searching = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  /** Realizar búsqueda de proveedores (clínicas y móviles) con filtros */
  search(filters: { district?: string; specialty?: string; type?: 'clinic' | 'mobile' }): void {
    this.searching.set(true);
    this.api.search(filters).subscribe({
      next: (providers) => {
        this.resultsSignal.set(providers);
        this.searching.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error searching providers');
        this.searching.set(false);
        this.notification.error('Error en la búsqueda');
      },
    });
  }
  getAllProviders(): Observable<OwnerServiceProviderEntity[]> {
    return this.api.search({});
  }
  /** Limpiar resultados */
  clearResults(): void {
    this.resultsSignal.set([]);
  }
}
