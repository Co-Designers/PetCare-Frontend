import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ClinicAppointmentService } from '../../../application/clinic-appointment';
import { ClinicPatientService } from '../../../application/clinic-patient';
import { ClinicClinicService } from '../../../application/clinic-clinic';
import { NotificationService } from '../../../../shared/application/notification';

@Component({
  selector: 'app-clinic-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './clinic-appointment-form.html',
  styleUrls: ['./clinic-appointment-form.css'],
})
export class ClinicAppointmentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly appointmentService = inject(ClinicAppointmentService);
  private readonly patientService = inject(ClinicPatientService);
  private readonly clinicService = inject(ClinicClinicService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  appointmentForm!: FormGroup;
  patients = this.patientService.patients;
  clinic = this.clinicService.clinic;

  isEditMode = false;
  appointmentId: number | null = null;

  timeSlots: string[] = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
  ];

  ngOnInit(): void {
    this.patientService.loadPatients();
    this.clinicService.loadClinicProfile();
    this.buildForm();

    const idParam = this.route.snapshot.params['id'];

    if (idParam && !Number.isNaN(Number(idParam))) {
      this.isEditMode = true;
      this.appointmentId = Number(idParam);
      this.loadAppointment();
    }
  }

  private buildForm(): void {
    this.appointmentForm = this.fb.group({
      petId: ['', Validators.required],
      serviceType: ['', Validators.required],
      appointmentDate: ['', [Validators.required, this.isWithinWorkingHours.bind(this)]],
      timeSlot: ['', Validators.required],
      notes: [''],
    });
  }

  private loadAppointment(): void {
    if (!this.appointmentId) return;

    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: (appointment) => {
        const appointmentDate = new Date(appointment.dateTime);
        const timeSlot = `${appointmentDate.getHours().toString().padStart(2, '0')}:00`;

        this.appointmentForm.patchValue({
          petId: appointment.petId,
          serviceType: appointment.serviceType,
          appointmentDate,
          timeSlot,
          notes: appointment.notes || '',
        });
      },
      error: () => this.notification.error('Error al cargar cita'),
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      this.notification.error('Completa los campos obligatorios');
      return;
    }

    const formValue = this.appointmentForm.value;
    const clinicId = this.clinic()?.id;

    if (!clinicId) {
      this.notification.error('No se encontró la clínica');
      return;
    }

    const appointmentData = {
      petId: Number(formValue.petId),
      serviceType: formValue.serviceType,
      dateTime: this.buildDateTime(formValue.appointmentDate, formValue.timeSlot),
      notes: formValue.notes || '',
      clinicId,
      providerType: 'clinic',
      providerId: clinicId,
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
    };

    if (this.isEditMode && this.appointmentId) {
      this.appointmentService.updateAppointment(this.appointmentId, appointmentData);
      this.notification.success('Cita actualizada correctamente');
    } else {
      this.appointmentService.createAppointment(appointmentData);
      this.notification.success('Cita creada correctamente');
    }

    this.router.navigate(['/clinic/appointments']).then();
  }

  onCancel(): void {
    this.router.navigate(['/clinic/appointments']).then();
  }

  isFieldInvalid(field: string): boolean {
    const control = this.appointmentForm.get(field);
    return !!control && control.invalid && control.touched;
  }

  isWithinWorkingHours(control: AbstractControl): ValidationErrors | null {
    const date = control.value;

    if (!date) return null;

    const selectedDate = new Date(date);
    const day = selectedDate.toLocaleDateString('en', { weekday: 'long' });

    if (day === 'Sunday') return { outsideHours: true };

    return null;
  }

  private buildDateTime(date: Date, timeSlot: string): string {
    const dateObj = new Date(date);
    const [hours, minutes] = timeSlot.split(':').map(Number);

    dateObj.setHours(hours, minutes || 0, 0, 0);

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hour = String(dateObj.getHours()).padStart(2, '0');
    const minute = String(dateObj.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hour}:${minute}:00`;
  }
}
