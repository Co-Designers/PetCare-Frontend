import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { OwnerAppointmentService } from '../../../application/owner-appointment';
import { OwnerPetService } from '../../../application/owner-pet';
import { NotificationService } from '../../../../shared/application/notification';
import { AvailabilityService, TimeSlot } from '../../../../shared/application/availability.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-owner-appointment-form',
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
  templateUrl: './owner-appointment-form.html',
  styleUrls: ['./owner-appointment-form.css'],
})
export class OwnerAppointmentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly appointmentService = inject(OwnerAppointmentService);
  private readonly petService = inject(OwnerPetService);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly availabilityService = inject(AvailabilityService);
  private readonly cdr = inject(ChangeDetectorRef);

  appointmentForm!: FormGroup;
  pets = this.petService.pets;

  isEditMode = false;
  appointmentId: number | null = null;

  allProviders: any[] = [];
  filteredProviders: any[] = [];
  currentProviderServices: string[] = [];
  availableSlots: TimeSlot[] = [];
  mobileAvailabilities: any[] = [];

  ngOnInit(): void {
    this.petService.loadPets();
    this.buildForm();
    this.loadProviders();
    this.loadMobileAvailabilities();
    this.listenFormChanges();
    this.applyQueryParams();
    this.checkEditMode();
  }

  private buildForm(): void {
    this.appointmentForm = this.fb.group({
      petId: ['', Validators.required],
      providerType: ['clinic', Validators.required],
      providerId: ['', Validators.required],
      appointmentDate: ['', [Validators.required, this.futureDateValidator.bind(this)]],
      timeSlot: ['', Validators.required],
      services: [[], Validators.required],
      notes: [''],
    });
  }

  private listenFormChanges(): void {
    this.appointmentForm.get('providerType')?.valueChanges.subscribe(() => {
      this.filterProviders();

      this.appointmentForm.patchValue({
        providerId: '',
        services: [],
        appointmentDate: '',
        timeSlot: '',
      });

      this.currentProviderServices = [];
      this.availableSlots = [];
      this.clearUnavailableDateError();
      this.cdr.detectChanges();
    });

    this.appointmentForm.get('providerId')?.valueChanges.subscribe((providerId) => {
      const id = Number(providerId);

      this.loadProviderServices(id);

      this.appointmentForm.patchValue({
        services: [],
        appointmentDate: '',
        timeSlot: '',
      });

      this.availableSlots = [];
      this.clearUnavailableDateError();
      this.appointmentForm.get('appointmentDate')?.updateValueAndValidity();
      this.cdr.detectChanges();
    });

    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.appointmentForm.patchValue({ timeSlot: '' });
      this.loadAvailableSlots();
    });
  }

  private applyQueryParams(): void {
    const queryParams = this.route.snapshot.queryParamMap;

    if (queryParams.has('providerId') && queryParams.has('providerType')) {
      setTimeout(() => {
        this.appointmentForm.patchValue({
          providerType: queryParams.get('providerType'),
          providerId: Number(queryParams.get('providerId')),
        });
      }, 500);
    }
  }

  private checkEditMode(): void {
    const idParam = this.route.snapshot.params['id'];

    if (!idParam) return;

    this.isEditMode = true;
    this.appointmentId = Number(idParam);
    this.loadAppointmentData();
  }

  private loadProviders(): void {
    const url = `${environment.platformProviderApiBaseUrl}/service-providers`;

    this.http.get<any[]>(url).subscribe({
      next: (providers) => {
        this.allProviders = providers.map((provider) => ({
          ...provider,
          id: Number(provider.id),
          name: this.resolveProviderName(provider),
          type: (provider.type || '').toString().toLowerCase(),
          servicesOffered: provider.servicesOffered || provider.services || [],
        }));

        this.filterProviders();
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Error al cargar proveedores'),
    });
  }

  private loadMobileAvailabilities(): void {
    this.http
      .get<any[]>(`${environment.platformProviderApiBaseUrl}/mobile-availability`)
      .subscribe({
        next: (availability) => {
          this.mobileAvailabilities = availability || [];
          this.appointmentForm?.get('appointmentDate')?.updateValueAndValidity();
          this.cdr.detectChanges();
        },
        error: () => {
          this.mobileAvailabilities = [];
          this.notification.error('Error al cargar disponibilidad móvil');
        },
      });
  }

  private filterProviders(): void {
    const currentType = (this.appointmentForm.get('providerType')?.value || '')
      .toString()
      .toLowerCase();

    this.filteredProviders = this.allProviders.filter(
      (provider) => (provider.type || '').toString().toLowerCase() === currentType,
    );
  }

  private loadProviderServices(providerId: number): void {
    const provider = this.allProviders.find((item) => Number(item.id) === Number(providerId));
    this.currentProviderServices = provider?.servicesOffered || [];
  }

  private loadAvailableSlots(): void {
    const providerId = this.appointmentForm.get('providerId')?.value;
    const date = this.appointmentForm.get('appointmentDate')?.value;
    const providerType = this.appointmentForm.get('providerType')?.value;

    if (!providerId || !date || !providerType) {
      this.availableSlots = [];
      return;
    }

    const selectedDate = new Date(date);

    if (!this.availableDateFilter(selectedDate)) {
      this.availableSlots = [];
      this.setUnavailableDateError();
      this.notification.error('Fecha no disponible para este proveedor');
      this.cdr.detectChanges();
      return;
    }

    this.clearUnavailableDateError();

    const dateStr = this.toDateOnlyString(selectedDate);

    if (providerType === 'clinic') {
      this.availabilityService.getClinicSlots(providerId, dateStr).subscribe({
        next: (slots) => {
          this.availableSlots = slots || [];

          if (this.availableSlots.length === 0) {
            this.setUnavailableDateError();
            this.notification.error('Fecha no disponible');
          } else {
            this.clearUnavailableDateError();
          }

          this.cdr.detectChanges();
        },
        error: () => {
          this.availableSlots = [];
          this.setUnavailableDateError();
          this.notification.error('Error al cargar horarios disponibles');
          this.cdr.detectChanges();
        },
      });

      return;
    }

    this.availabilityService.getMobileSlots(providerId, dateStr).subscribe({
      next: (slots) => {
        this.availableSlots = slots || [];

        if (this.availableSlots.length === 0) {
          this.setUnavailableDateError();
          this.notification.error('Fecha no disponible para este profesional');
        } else {
          this.clearUnavailableDateError();
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.availableSlots = [];
        this.setUnavailableDateError();
        this.notification.error('Error al cargar horarios disponibles');
        this.cdr.detectChanges();
      },
    });
  }

  private loadAppointmentData(): void {
    if (!this.appointmentId) return;

    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: (appointment) => {
        const appointmentDateTime = new Date(appointment.dateTime);

        const servicesArray = appointment.serviceType
          ? appointment.serviceType.split(', ').filter((service: string) => service.trim() !== '')
          : [];

        const timeSlot = `${appointmentDateTime.getHours().toString().padStart(2, '0')}:00`;

        this.appointmentForm.patchValue({
          petId: appointment.petId,
          providerType: appointment.providerType,
          providerId: appointment.providerId,
          appointmentDate: appointmentDateTime,
          timeSlot,
          services: servicesArray,
          notes: appointment.notes || '',
        });

        this.loadProviderServices(appointment.providerId);
        setTimeout(() => this.loadAvailableSlots(), 150);
      },
      error: () => {
        this.notification.error('Error al cargar la cita');
        this.onCancel();
      },
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      this.notification.error('Completa los campos obligatorios');
      return;
    }

    const formValue = this.appointmentForm.value;
    const providerId = Number(formValue.providerId);
    const dateTime = this.buildDateTime(formValue.appointmentDate, formValue.timeSlot);

    const userId =
      Number(localStorage.getItem('userId')) ||
      Number(localStorage.getItem('currentUserId')) ||
      Number(localStorage.getItem('id'));

    const appointmentData: any = {
      petId: Number(formValue.petId),
      providerId,
      providerType: formValue.providerType,
      serviceType: formValue.services.join(', '),
      dateTime,
      notes: formValue.notes || '',
      status: 'pending',
      paymentStatus: 'pending',
    };

    if (!Number.isNaN(userId) && userId > 0) {
      appointmentData.ownerId = userId;
    }

    if (formValue.providerType === 'clinic') {
      appointmentData.clinicId = providerId;
    }

    if (this.isEditMode && this.appointmentId) {
      this.http
        .put(
          `${environment.platformProviderApiBaseUrl}/appointments/${this.appointmentId}`,
          appointmentData,
        )
        .subscribe({
          next: () => {
            this.notification.success('Cita actualizada');
            this.router.navigate(['/owner/appointments']).then();
          },
          error: (error) => {
            console.error('Error updating appointment', error);
            this.notification.error(error?.error?.error || 'Error al actualizar la cita');
          },
        });

      return;
    }

    this.http
      .post(`${environment.platformProviderApiBaseUrl}/appointments`, appointmentData)
      .subscribe({
        next: () => {
          this.notification.success('Cita creada correctamente');
          this.router.navigate(['/owner/appointments']).then();
        },
        error: (error) => {
          console.error('Error creating appointment', error);
          this.notification.error(error?.error?.error || 'Error al crear la cita');
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/owner/appointments']).then();
  }

  availableDateFilter = (date: Date | null): boolean => {
    if (!date) return false;

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) return false;

    const providerType = this.appointmentForm?.get('providerType')?.value;
    const providerId = Number(this.appointmentForm?.get('providerId')?.value);
    const dateStr = this.toDateOnlyString(selectedDate);

    if (providerType === 'clinic') {
      return selectedDate.getDay() !== 0;
    }

    if (providerType === 'mobile') {
      if (!providerId) return false;

      return this.mobileAvailabilities.some((availability) => {
        return (
          Number(availability.mobileId) === providerId &&
          availability.date === dateStr &&
          availability.isAvailable !== false
        );
      });
    }

    return true;
  };

  futureDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate < today ? { pastDate: true } : null;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.appointmentForm.get(field);
    return !!control && control.invalid && control.touched;
  }

  private setUnavailableDateError(): void {
    const control = this.appointmentForm.get('appointmentDate');
    if (!control) return;

    const errors = control.errors || {};
    control.setErrors({
      ...errors,
      unavailableDate: true,
    });
  }

  private clearUnavailableDateError(): void {
    const control = this.appointmentForm.get('appointmentDate');

    if (!control || !control.errors) return;

    const errors = { ...control.errors };
    delete errors['unavailableDate'];

    control.setErrors(Object.keys(errors).length ? errors : null);
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

  private toDateOnlyString(date: Date): string {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private resolveProviderName(provider: any): string {
    return (
      provider?.name ||
      provider?.clinicName ||
      provider?.fullName ||
      provider?.businessName ||
      provider?.displayName ||
      'Proveedor'
    );
  }
}
