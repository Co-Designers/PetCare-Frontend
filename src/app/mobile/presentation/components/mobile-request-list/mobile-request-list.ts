import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslatePipe } from '@ngx-translate/core';

import { MobileRequestService } from '../../../application/mobile-request';

@Component({
  selector: 'app-mobile-request-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './mobile-request-list.html',
  styleUrls: ['./mobile-request-list.css'],
})
export class MobileRequestListComponent implements OnInit {
  private readonly requestService = inject(MobileRequestService);

  get requests(): any[] {
    return this.requestService.requests() as any[];
  }

  get loading(): boolean {
    return this.requestService.loading();
  }

  ngOnInit(): void {
    this.requestService.loadRequests();
  }

  accept(id: number): void {
    if (!id) return;

    this.requestService.acceptRequest(id);

    setTimeout(() => {
      this.requestService.loadRequests();
    }, 250);
  }

  reject(id: number): void {
    if (!id) return;

    this.requestService.rejectRequest(id);

    setTimeout(() => {
      this.requestService.loadRequests();
    }, 250);
  }

  isPending(status: string): boolean {
    return String(status || '').toLowerCase() === 'pending';
  }

  getStatusClass(status: string): string {
    const normalizedStatus = String(status || '').toLowerCase();

    switch (normalizedStatus) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-default';
    }
  }

  getStatusLabel(status: string): string {
    const normalizedStatus = String(status || '').toLowerCase();

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
      completed: 'Completada',
    };

    return labels[normalizedStatus] || 'Sin estado';
  }

  getDateLabel(request: any): string {
    const dateTime = request?.scheduledDateTime || request?.dateTime || request?.date;

    if (!dateTime) return 'Fecha no registrada';

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) return 'Fecha no registrada';

    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
