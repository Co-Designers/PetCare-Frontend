import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslatePipe } from '@ngx-translate/core';

import { MobileRequestService } from '../../../application/mobile-request';
import { MobileServiceService } from '../../../application/mobile-service';

@Component({
  selector: 'app-mobile-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './mobile-dashboard.html',
  styleUrls: ['./mobile-dashboard.css'],
})
export class MobileDashboardComponent implements OnInit {
  private readonly requestService = inject(MobileRequestService);
  private readonly serviceService = inject(MobileServiceService);

  get requests(): any[] {
    return this.requestService.requests() as any[];
  }

  get services(): any[] {
    return this.serviceService.services() as any[];
  }

  get pendingRequests(): number {
    return this.requests.filter((request: any) => {
      const status = String(request?.status || '').toLowerCase();
      return status === 'pending';
    }).length;
  }

  get activeServices(): number {
    return this.services.filter((service: any) => {
      return service?.isActive !== false;
    }).length;
  }

  get loadingRequests(): boolean {
    return this.requestService.loading();
  }

  get loadingServices(): boolean {
    return this.serviceService.loading();
  }

  ngOnInit(): void {
    this.requestService.loadRequests();
    this.serviceService.loadServices();
  }
}
