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
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
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
    const clinics$ = this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}/clinics`).pipe(
      map((clinics) => (clinics || []).map((clinic) => this.mapClinicProvider(clinic))),
      catchError(() => of([] as any[])),
    );

    const mobileProfessionals$ = this.http
      .get<any[]>(`${environment.platformProviderApiBaseUrl}/mobile-professionals`)
      .pipe(
        map((professionals) =>
          (professionals || []).map((professional) => this.mapMobileProvider(professional)),
        ),
        catchError(() => of([] as any[])),
      );

    forkJoin([clinics$, mobileProfessionals$]).subscribe({
      next: ([clinics, mobileProfessionals]) => {
        this.allProviders = [...clinics, ...mobileProfessionals];

        if (this.allProviders.length === 0) {
          this.allProviders = this.getFallbackProviders();
        }

        this.filterProviders();
        this.cdr.detectChanges();
      },
      error: () => {
        this.allProviders = this.getFallbackProviders();
        this.filterProviders();
        this.cdr.detectChanges();
      },
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
    const providerType = (this.appointmentForm.get('providerType')?.value || '').toString().toLowerCase();

    this.currentProviderServices = provider?.servicesOffered || [];

    if (!providerId) return;

    if (providerType === 'clinic') {
      this.http
        .get<any[]>(`${environment.platformProviderApiBaseUrl}/services?clinicId=${providerId}`)
        .pipe(catchError(() => of([] as any[])))
        .subscribe((services) => {
          const serviceNames = (services || [])
            .map((service) => service?.name || service?.serviceName)
            .filter(Boolean);

          this.currentProviderServices =
            serviceNames.length > 0
              ? serviceNames
              : this.currentProviderServices.length > 0
                ? this.currentProviderServices
                : ['Consulta general', 'Vacunación', 'Control preventivo'];

          this.cdr.detectChanges();
        });
      return;
    }

    if (providerType === 'mobile') {
      const mobileId = this.resolveMobileId(providerId);

      this.http
        .get<any[]>(`${environment.platformProviderApiBaseUrl}/mobile-services?mobileId=${mobileId}`)
        .pipe(catchError(() => of([] as any[])))
        .subscribe((services) => {
          const serviceNames = (services || [])
            .map((service) => service?.name || service?.serviceName)
            .filter(Boolean);

          this.currentProviderServices =
            serviceNames.length > 0
              ? serviceNames
              : this.currentProviderServices.length > 0
                ? this.currentProviderServices
                : ['Consulta a domicilio', 'Vacunación a domicilio'];

          this.cdr.detectChanges();
        });
    }
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
      this.availabilityService.getClinicSlots(Number(providerId), dateStr).subscribe({
        next: (slots) => {
          this.availableSlots = slots?.length ? slots : this.getDefaultSlots();

          if (this.availableSlots.length === 0) {
            this.setUnavailableDateError();
            this.notification.error('Fecha no disponible');
          } else {
            this.clearUnavailableDateError();
          }

          this.cdr.detectChanges();
        },
        error: () => {
          this.availableSlots = this.getDefaultSlots();
          this.clearUnavailableDateError();
          this.cdr.detectChanges();
        },
      });

      return;
    }

    const mobileId = this.resolveMobileId(Number(providerId));

    this.availabilityService.getMobileSlots(mobileId, dateStr).subscribe({
      next: (slots) => {
        this.availableSlots = slots?.length ? slots : this.getDefaultSlots();

        if (this.availableSlots.length === 0) {
          this.setUnavailableDateError();
          this.notification.error('Fecha no disponible para este profesional');
        } else {
          this.clearUnavailableDateError();
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.availableSlots = this.getDefaultSlots();
        this.clearUnavailableDateError();
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
    const providerType = (formValue.providerType || '').toString().toLowerCase();
    const dateTime = this.buildDateTime(formValue.appointmentDate, formValue.timeSlot);
    const selectedServices = Array.isArray(formValue.services) ? formValue.services : [];
    const selectedServiceName = selectedServices[0] || 'Servicio móvil';

    const userId =
      Number(localStorage.getItem('userId')) ||
      Number(localStorage.getItem('currentUserId')) ||
      Number(localStorage.getItem('id'));

    const appointmentData: any = {
      petId: Number(formValue.petId),
      providerId,
      providerType,
      serviceType: selectedServices.join(', '),
      dateTime,
      notes: formValue.notes || '',
      status: 'pending',
      paymentStatus: 'pending',
    };

    if (!Number.isNaN(userId) && userId > 0) {
      appointmentData.ownerId = userId;
    }

    if (providerType === 'clinic') {
      appointmentData.clinicId = providerId;
      appointmentData.status = 'confirmed';
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

    if (providerType === 'mobile') {
      const mobileId = this.resolveMobileId(providerId);

      this.resolveMobileServiceId(mobileId, selectedServiceName)
        .pipe(
          switchMap((serviceId) => {
            const mobileRequestData = {
              mobileId,
              ownerId: userId,
              petId: Number(formValue.petId),
              serviceId,
              status: 'accepted',
              scheduledDateTime: dateTime,
              address: this.resolveOwnerAddress(),
              notes: formValue.notes || 'Solicitud generada desde la agenda del dueño.',
              createdAt: new Date().toISOString(),
            };

            return this.http.post<any>(
              `${environment.platformProviderApiBaseUrl}/mobile-requests`,
              mobileRequestData,
            );
          }),
        )
        .subscribe({
          next: () => {
            this.notification.success('Solicitud móvil creada correctamente');
            this.router.navigate(['/owner/appointments']).then();
          },
          error: (error) => {
            console.error('Error creating mobile request', error);
            this.notification.error(error?.error?.message || 'Error al crear la solicitud móvil');
          },
        });

      return;
    }

    this.http
      .post<any>(`${environment.platformProviderApiBaseUrl}/appointments`, appointmentData)
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

    if (providerType === 'clinic') {
      return selectedDate.getDay() !== 0;
    }

    if (providerType === 'mobile') {
      return !!providerId;
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

    return `${year}-${month}-${day}T${hour}:${minute}:00Z`;
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

  private resolveMobileId(providerId: number): number {
    const provider = this.allProviders.find((item) => Number(item.id) === Number(providerId));
    return Number(provider?.mobileId || provider?.userId || provider?.id || providerId);
  }

  private resolveMobileServiceId(mobileId: number, serviceName: string) {
    return this.http
      .get<any[]>(`${environment.platformProviderApiBaseUrl}/mobile-services?mobileId=${mobileId}`)
      .pipe(
        map((services) => {
          const normalizedServiceName = (serviceName || '').trim().toLowerCase();
          const found = (services || []).find(
            (service) => (service?.name || '').trim().toLowerCase() === normalizedServiceName,
          );

          return Number(found?.id || services?.[0]?.id || 1);
        }),
        catchError(() => of(1)),
      );
  }

  private resolveOwnerAddress(): string {
    const rawUser = localStorage.getItem('user') || localStorage.getItem('currentUser');

    if (!rawUser) return 'Dirección registrada del dueño';

    try {
      const user = JSON.parse(rawUser);
      const district = user?.district ? `, ${user.district}` : '';
      return user?.address || `Dirección registrada del dueño${district}`;
    } catch {
      return 'Dirección registrada del dueño';
    }
  }

  private mapClinicProvider(clinic: any): any {
    return {
      ...clinic,
      id: Number(clinic.id),
      type: 'clinic',
      name: this.resolveProviderName(clinic),
      servicesOffered:
        clinic.servicesOffered || clinic.services || ['Consulta general', 'Vacunación', 'Control preventivo'],
    };
  }

  private mapMobileProvider(professional: any): any {
    return {
      ...professional,
      id: Number(professional.id),
      mobileId: Number(professional.id),
      type: 'mobile',
      name: this.resolveProviderName(professional),
      servicesOffered:
        professional.servicesOffered || professional.services || ['Consulta a domicilio', 'Vacunación a domicilio'],
    };
  }

  private getDefaultSlots(): TimeSlot[] {
    return [
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '12:00' },
      { startTime: '15:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '17:00' },
    ] as TimeSlot[];
  }

  private getFallbackProviders(): any[] {
    return [
      {
        id: 1,
        type: 'clinic',
        name: 'Veterinaria San Martín',
        servicesOffered: ['Consulta general', 'Vacunación', 'Control preventivo'],
      },
      {
        id: 1,
        mobileId: 1,
        type: 'mobile',
        name: 'Dra. Valeria Ramos',
        servicesOffered: ['Consulta a domicilio', 'Vacunación a domicilio'],
      },
    ];
  }
}
