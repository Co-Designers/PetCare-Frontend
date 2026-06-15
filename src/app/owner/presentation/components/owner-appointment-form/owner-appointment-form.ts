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
  private fb = inject(FormBuilder);
  private appointmentService = inject(OwnerAppointmentService);
  private petService = inject(OwnerPetService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private availabilityService = inject(AvailabilityService);
  private cdr = inject(ChangeDetectorRef);
  appointmentForm!: FormGroup;
  pets = this.petService.pets;
  isEditMode = false;
  appointmentId: number | null = null;

  allProviders: any[] = [];
  filteredProviders: any[] = [];
  currentProviderServices: string[] = [];

  // Propiedades para disponibilidad
  availableSlots: TimeSlot[] = [];
  selectedTime: string = '';

  ngOnInit(): void {
    this.petService.loadPets();
    this.buildForm();
    this.loadProviders();

    // Al cambiar el tipo de proveedor, resetear proveedor, servicios y slots
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
    });

    // Al cambiar el proveedor, cargar sus servicios y recargar slots si hay fecha
    this.appointmentForm.get('providerId')?.valueChanges.subscribe((providerId) => {
      const pid = Number(providerId);
      this.loadProviderServices(pid);
      this.appointmentForm.patchValue({ services: [], timeSlot: '' });
      this.loadAvailableSlots(); // recargar slots si ya hay fecha seleccionada
    });

    // Al cambiar la fecha, recargar slots y resetear hora seleccionada
    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.appointmentForm.patchValue({ timeSlot: '' });
      this.loadAvailableSlots();
    });

    // Verificar si viene desde la búsqueda
    const queryParams = this.route.snapshot.queryParamMap;
    if (queryParams.has('providerId') && queryParams.has('providerType')) {
      setTimeout(() => {
        this.appointmentForm.patchValue({
          providerType: queryParams.get('providerType'),
          providerId: +queryParams.get('providerId')!,
        });
      }, 500);
    }

    // Modo edición
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.isEditMode = true;
      this.appointmentId = +idParam;
      this.loadAppointmentData();
    }
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

  private loadProviders(): void {
    const url = `${environment.platformProviderApiBaseUrl}/service-providers`;
    this.http.get<any[]>(url).subscribe({
      next: (providers) => {
        // Normalizar proveedores: asegurar id numérico y type en minúsculas
        this.allProviders = providers.map((p) => ({
          ...p,
          id: Number(p.id),
          type: (p.type || '').toString().toLowerCase(),
          servicesOffered: p.servicesOffered || p.services || [],
        }));
        this.filterProviders();
      },
      error: () => this.notification.error('Error al cargar proveedores'),
    });
  }

  private filterProviders(): void {
    const currentType = (this.appointmentForm.get('providerType')?.value || '').toString().toLowerCase();
    this.filteredProviders = this.allProviders.filter((p) => (p.type || '').toString().toLowerCase() === currentType);
  }

  private loadProviderServices(providerId: number): void {
    const provider = this.allProviders.find((p) => Number(p.id) === Number(providerId));
    if (provider && provider.servicesOffered) {
      this.currentProviderServices = provider.servicesOffered;
    } else {
      this.currentProviderServices = [];
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

    const dateStr = new Date(date).toISOString().split('T')[0];

    if (providerType === 'clinic') {
      this.availabilityService.getClinicSlots(providerId, dateStr).subscribe({
        next: (slots) => {
          this.availableSlots = slots;
          this.cdr.detectChanges(); // 👈 Forzar detección de cambios
        },
        error: () => {
          this.notification.error('Error al cargar horarios disponibles');
          this.availableSlots = [];
          this.cdr.detectChanges();
        },
      });
    } else {
      this.availabilityService.getMobileSlots(providerId, dateStr).subscribe({
        next: (slots) => {
          this.availableSlots = slots;
          this.cdr.detectChanges(); // 👈 Forzar detección de cambios
        },
        error: () => {
          this.notification.error('Error al cargar horarios disponibles');
          this.availableSlots = [];
          this.cdr.detectChanges();
        },
      });
    }
  }

  private loadAppointmentData(): void {
    if (!this.appointmentId) return;
    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: (app) => {
        // Convertir serviceType (string) a array de servicios
        const servicesArray = app.serviceType
          ? app.serviceType.split(', ').filter((s: string) => s.trim() !== '')
          : [];

        // Parsear fecha y hora desde app.dateTime
        const appointmentDateTime = new Date(app.dateTime);
        const appointmentDate = appointmentDateTime;
        const timeSlot = `${appointmentDateTime.getHours().toString().padStart(2, '0')}:00`;

        this.appointmentForm.patchValue({
          petId: app.petId,
          providerType: app.providerType,
          providerId: app.providerId,
          appointmentDate: appointmentDate,
          timeSlot: timeSlot,
          services: servicesArray,
          notes: app.notes || '',
        });

        this.loadProviders();
        this.loadProviderServices(app.providerId);
        // Cargar los slots después de haber seteado proveedor y fecha
        setTimeout(() => this.loadAvailableSlots(), 100);
      },
      error: () => {
        this.notification.error('Error al cargar la cita');
        this.router.navigate(['/owner/appointments']);
      },
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) return;

    const formValue = this.appointmentForm.value;

    // Construir dateTime combinando appointmentDate y timeSlot
    const dateObj = new Date(formValue.appointmentDate);
    const [hours, minutes] = formValue.timeSlot.split(':');
    dateObj.setHours(+hours, +minutes, 0, 0);
    const dateTime = dateObj.toISOString();

    const appointmentData: any = {
      petId: formValue.petId,
      providerType: formValue.providerType,
      serviceType: formValue.services.join(', '),
      dateTime: dateTime,
      notes: formValue.notes,
    };
    // Si el proveedor es una clínica, enviar clinicId (el formulario usa providerId)
    if (formValue.providerType === 'clinic') {
      appointmentData.clinicId = Number(formValue.providerId);
      // también incluir providerId por compatibilidad
      appointmentData.providerId = Number(formValue.providerId);
    } else {
      // mobile
      appointmentData.providerId = Number(formValue.providerId);
    }

    if (this.isEditMode && this.appointmentId) {
      this.appointmentService.updateAppointment(this.appointmentId, appointmentData);
    } else {
      // ✅ Corregido: agregar status y paymentStatus como literales exactos
      const newAppointment = {
        ...appointmentData,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
      };
      this.appointmentService.createAppointment(newAppointment);
    }
    this.router.navigate(['/owner/appointments']).then();
  }

  futureDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return { pastDate: true };
    return null;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.appointmentForm.get(field);
    return !!control && control.invalid && control.touched;
  }
}
