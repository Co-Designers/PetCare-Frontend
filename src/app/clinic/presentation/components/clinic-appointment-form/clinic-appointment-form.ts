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
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
    TranslatePipe,
  ],
  templateUrl: './clinic-appointment-form.html',
  styleUrls: ['./clinic-appointment-form.css'],
})
export class ClinicAppointmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private appointmentService = inject(ClinicAppointmentService);
  private patientService = inject(ClinicPatientService);
  private clinicService = inject(ClinicClinicService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  appointmentForm!: FormGroup;
  patients = this.patientService.patients;
  clinic = this.clinicService.clinic;
  isEditMode = false;
  appointmentId: number | null = null;

  ngOnInit(): void {
    this.patientService.loadPatients();
    this.clinicService.loadClinicProfile();
    this.buildForm();
    const idParam = this.router.url.split('/').pop();
    if (idParam && !isNaN(+idParam)) {
      this.isEditMode = true;
      this.appointmentId = +idParam;
      this.loadAppointment();
    }
  }

  buildForm(): void {
    this.appointmentForm = this.fb.group({
      petId: ['', Validators.required],
      serviceType: ['', Validators.required],
      dateTime: ['', [Validators.required, this.isWithinWorkingHours.bind(this)]],
      notes: [''],
    });
  }

  loadAppointment(): void {
    if (!this.appointmentId) return;
    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: (app) => {
        this.appointmentForm.patchValue({
          petId: app.petId,
          serviceType: app.serviceType,
          dateTime: app.dateTime,
          notes: app.notes || '',
        });
      },
      error: () => this.notification.error('Error al cargar cita'),
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) return;
    const formValue = this.appointmentForm.value;
    const clinicId = this.clinic()?.id;
    if (!clinicId) return;

    if (this.isEditMode && this.appointmentId) {
      this.appointmentService.updateAppointment(this.appointmentId, formValue);
    } else {
      const newAppointment = {
        ...formValue,
        clinicId,
        status: 'pending',
        paymentStatus: 'pending',
      };
      // Asegúrate de que el servicio tenga el método createAppointment
      this.appointmentService.createAppointment(newAppointment);
    }
    this.router.navigate(['/clinic/appointments']);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.appointmentForm.get(field);
    return !!control && control.invalid && control.touched;
  }

  isWithinWorkingHours(control: AbstractControl): ValidationErrors | null {
    const dateTime = control.value;
    if (!dateTime) return null;
    const openingHours = this.clinic()?.openingHours;
    if (!openingHours) return null;
    const selectedDate = new Date(dateTime);
    const day = selectedDate.toLocaleDateString('en', { weekday: 'long' });
    const hour = selectedDate.getHours();
    // Lógica simplificada (ajústala a los horarios reales de tu clínica)
    if (day === 'Saturday' && (hour < 9 || hour >= 14)) return { outsideHours: true };
    if (day === 'Sunday') return { outsideHours: true };
    if (hour < 8 || hour >= 20) return { outsideHours: true };
    return null;
  }
}
