import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { ClinicAppointmentService } from '../../../application/clinic-appointment';
import { NotificationService } from '../../../../shared/application/notification';

@Component({
  selector: 'app-clinic-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, TranslatePipe],
  templateUrl: './clinic-appointment-detail.html',
  styleUrls: ['./clinic-appointment-detail.css'],
})
export class ClinicAppointmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appointmentService = inject(ClinicAppointmentService);
  private notification = inject(NotificationService);

  appointment: any = null;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.appointmentService.getAppointmentById(id).subscribe({
        next: (data) => {
          this.appointment = data;
          this.loading = false;
        },
        error: () => {
          this.notification.error('Error al cargar la cita');
          this.router.navigate(['/clinic/appointments']);
        },
      });
    }
  }

  updateStatus(status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): void {
    if (this.appointment) {
      this.appointmentService.updateAppointmentStatus(this.appointment.id, status);
      this.router.navigate(['/clinic/appointments']);
    }
  }
}
