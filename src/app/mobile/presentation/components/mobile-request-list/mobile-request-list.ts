import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import { MobileRequestService } from '../../../application/mobile-request';

@Component({
  selector: 'app-mobile-request-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    TranslatePipe,
  ],
  templateUrl: './mobile-request-list.html',
  styleUrls: ['./mobile-request-list.css'],
})
export class MobileRequestListComponent implements OnInit {
  private requestService = inject(MobileRequestService);

  get requests() {
    return this.requestService.requests();
  }
  get loading() {
    return this.requestService.loading();
  }

  ngOnInit(): void {
    this.requestService.loadRequests();
  }

  accept(id: number): void {
    this.requestService.acceptRequest(id);
  }

  reject(id: number): void {
    this.requestService.rejectRequest(id);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'warn';
      case 'accepted':
        return 'primary';
      case 'rejected':
        return 'accent';
      case 'completed':
        return '';
      default:
        return '';
    }
  }
}
