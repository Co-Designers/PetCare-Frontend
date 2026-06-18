import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslatePipe } from '@ngx-translate/core';

import { MobileRequestService } from '../../../application/mobile-request';
import { NotificationService } from '../../../../shared/application/notification';

@Component({
  selector: 'app-mobile-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './mobile-request-detail.html',
  styleUrls: ['./mobile-request-detail.css'],
})
export class MobileRequestDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly requestService = inject(MobileRequestService);
  private readonly notification = inject(NotificationService);

  request: any = null;
  loading = true;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      this.notification.error('Solicitud inválida');
      this.router.navigate(['/mobile/requests']);
      return;
    }

    this.requestService.getRequestById(id).subscribe({
      next: (data) => {
        this.request = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Error al cargar solicitud');
        this.router.navigate(['/mobile/requests']);
      },
    });
  }

  accept(): void {
    if (!this.request?.id) return;

    this.requestService.acceptRequest(this.request.id);
    this.notification.success('Solicitud aceptada correctamente');

    setTimeout(() => {
      this.router.navigate(['/mobile/requests']);
    }, 250);
  }

  reject(): void {
    if (!this.request?.id) return;

    this.requestService.rejectRequest(this.request.id);
    this.notification.success('Solicitud rechazada correctamente');

    setTimeout(() => {
      this.router.navigate(['/mobile/requests']);
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
