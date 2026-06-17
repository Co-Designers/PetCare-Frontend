import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { OwnerSearchService } from '../../../application/owner-search';
import { OwnerSearchFiltersComponent } from '../../components/owner-search-filters/owner-search-filters';
import { OwnerServiceCardComponent } from '../../components/owner-service-card/owner-service-card';

@Component({
  selector: 'app-owner-search-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    OwnerSearchFiltersComponent,
    OwnerServiceCardComponent,
    TranslatePipe,
  ],
  templateUrl: './owner-search-page.html',
  styleUrls: ['./owner-search-page.css'],
})
export class OwnerSearchPageComponent {
  private readonly searchService = inject(OwnerSearchService);
  private readonly router = inject(Router);

  get results() {
    return this.searchService.results();
  }

  get searching() {
    return this.searchService.searching();
  }

  get clinicCount(): number {
    return this.results.filter((provider: any) => provider.type === 'clinic').length;
  }

  get mobileCount(): number {
    return this.results.filter((provider: any) => provider.type === 'mobile').length;
  }

  onSearch(filters: any): void {
    this.searchService.search(filters);
  }

  onSelectProvider(provider: any): void {
    this.router
      .navigate(['/owner/appointments/new'], {
        queryParams: {
          providerId: provider.id,
          providerType: provider.type,
        },
      })
      .then();
  }
}
