import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OwnerSearchService } from '../../../application/owner-search';
import { OwnerSearchFiltersComponent } from '../../components/owner-search-filters/owner-search-filters';
import { OwnerServiceCardComponent } from '../../components/owner-service-card/owner-service-card';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-owner-search-page',
  standalone: true,
  imports: [CommonModule, OwnerSearchFiltersComponent, OwnerServiceCardComponent, TranslatePipe],
  templateUrl: './owner-search-page.html',
  styleUrls: ['./owner-search-page.css'],
})
export class OwnerSearchPageComponent {
  private searchService = inject(OwnerSearchService);
  private router = inject(Router);

  get results() {
    return this.searchService.results();
  }
  get searching() {
    return this.searchService.searching();
  }

  onSearch(filters: any): void {
    this.searchService.search(filters);
  }

  onSelectProvider(provider: any): void {
    this.router
      .navigate(['/owner/appointments/new'], {
        queryParams: { providerId: provider.id, providerType: provider.type },
      })
      .then();
  }
}
