import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslatePipe } from '@ngx-translate/core';

import { MobileRequestService } from '../../../application/mobile-request';

@Component({
  selector: 'app-mobile-request-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
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

  complete(id: number): void {
    if (!id) return;

    this.requestService.completeRequest(id);

    setTimeout(() => {
      this.requestService.loadRequests();
    }, 250);
  }

  deleteRequest(id: number): void {
    if (!id) return;

    if (!confirm('¿Eliminar esta solicitud?')) return;

    this.requestService.deleteRequest(id);
  }

  isPending(status: string | null | undefined): boolean {
    const normalizedStatus = String(status || '').toLowerCase();
    return !normalizedStatus || normalizedStatus === 'pending';
  }

  isAccepted(status: string | null | undefined): boolean {
    const normalizedStatus = String(status || '').toLowerCase();
    return (
      normalizedStatus === 'accepted' ||
      normalizedStatus === 'confirmed' ||
      normalizedStatus === 'in_process'
    );
  }

  getStatusClass(status: string): string {
    const normalizedStatus = String(status || '').toLowerCase();

    switch (normalizedStatus) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
      case 'confirmed':
      case 'in_process':
        return 'status-accepted';
      case 'rejected':
      case 'cancelled':
      case 'canceled':
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
      confirmed: 'Aceptada',
      in_process: 'Aceptada',
      rejected: 'Cancelada',
      cancelled: 'Cancelada',
      canceled: 'Cancelada',
      completed: 'Completada',
    };

    return labels[normalizedStatus] || 'Pendiente';
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
