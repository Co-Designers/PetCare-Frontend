import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ClinicAppointmentService } from '../../../application/clinic-appointment';
import { NotificationService } from '../../../../shared/application/notification';

@Component({
  selector: 'app-clinic-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './clinic-appointment-detail.html',
  styleUrls: ['./clinic-appointment-detail.css'],
})
export class ClinicAppointmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appointmentService = inject(ClinicAppointmentService);
  private readonly notification = inject(NotificationService);

  appointment: any = null;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    if (!id) {
      this.router.navigate(['/clinic/appointments']).then();
      return;
    }

    this.appointmentService.getAppointmentById(id).subscribe({
      next: (data) => {
        this.appointment = data;
        this.loading = false;
      },
      error: () => {
        this.notification.error('Error al cargar la cita');
        this.router.navigate(['/clinic/appointments']).then();
      },
    });
  }

  updateStatus(status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): void {
    if (!this.appointment) return;

    const updatedAppointment = {
      ...this.appointment,
      status,
      paymentStatus:
        status === 'completed' ? 'paid' : status === 'cancelled' ? 'cancelled' : 'pending',
    };

    this.appointmentService.updateAppointment(this.appointment.id, updatedAppointment);
    this.notification.success('Estado de cita actualizado');
    this.router.navigate(['/clinic/appointments']).then();
  }

  getStatusLabel(status: string | null | undefined): string {
    const normalized = (status || '').toLowerCase();

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
      canceled: 'Cancelada',
    };

    return labels[normalized] || status || 'Sin estado';
  }

  getStatusClass(status: string | null | undefined): string {
    const normalized = (status || '').toLowerCase();

    if (normalized === 'pending') return 'pending';
    if (normalized === 'confirmed') return 'confirmed';
    if (normalized === 'completed') return 'completed';
    if (normalized === 'cancelled' || normalized === 'canceled') return 'cancelled';

    return 'pending';
  }
}
