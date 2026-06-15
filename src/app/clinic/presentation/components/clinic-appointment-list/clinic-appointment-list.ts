import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 👈 IMPORTANTE para ngModel
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { ClinicAppointmentService } from '../../../application/clinic-appointment';
import { ClinicVeterinarianService } from '../../../application/clinic-veterinarian';

@Component({
  selector: 'app-clinic-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
  ],
  templateUrl: './clinic-appointment-list.html',
  styleUrls: ['./clinic-appointment-list.css'],
})
export class ClinicAppointmentListComponent implements OnInit {
  private appointmentService = inject(ClinicAppointmentService);
  private vetService = inject(ClinicVeterinarianService);

  // Filtros
  filterDate: string = '';
  filterVetId: number | null = null;
  filterStatus: string = '';

  get appointments() {
    return this.appointmentService.appointments();
  }
  get loading() {
    return this.appointmentService.loading();
  }
  get veterinarians() {
    return this.vetService.veterinarians();
  }

  get filteredAppointments() {
    let list = this.appointments;
    if (this.filterDate) list = list.filter((a) => a.dateTime.startsWith(this.filterDate));
    if (this.filterVetId) list = list.filter((a) => a.veterinarianId === this.filterVetId);
    if (this.filterStatus) list = list.filter((a) => a.status === this.filterStatus);
    return list;
  }

  ngOnInit(): void {
    this.appointmentService.loadAppointments();
    this.vetService.loadVeterinarians();
  }

  updateStatus(id: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): void {
    this.appointmentService.updateAppointmentStatus(id, status);
  }

  resetFilters(): void {
    this.filterDate = '';
    this.filterVetId = null;
    this.filterStatus = '';
  }
}
