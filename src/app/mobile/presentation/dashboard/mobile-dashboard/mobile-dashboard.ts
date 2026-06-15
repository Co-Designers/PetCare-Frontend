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
  private requestService = inject(MobileRequestService);
  private serviceService = inject(MobileServiceService);

  get pendingRequests() {
    return this.requestService.requests().filter((r) => r.status === 'pending').length;
  }
  get activeServices() {
    return this.serviceService.services().filter((s) => s.isActive !== false).length;
  }
  get loadingRequests() {
    return this.requestService.loading();
  }
  get loadingServices() {
    return this.serviceService.loading();
  }

  ngOnInit(): void {
    this.requestService.loadRequests();
    this.serviceService.loadServices();
  }
}
