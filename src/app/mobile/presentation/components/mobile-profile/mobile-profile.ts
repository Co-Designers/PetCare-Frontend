import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

import { TranslatePipe } from '@ngx-translate/core';

import { MobileProfessionalService } from '../../../application/mobile-professional';
import { NotificationService } from '../../../../shared/application/notification';
import { DISTRICTS_LIMA } from '../../../../shared/constants/districts';

@Component({
  selector: 'app-mobile-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './mobile-profile.html',
  styleUrls: ['./mobile-profile.css'],
})
export class MobileProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(MobileProfessionalService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  form!: FormGroup;

  districts = DISTRICTS_LIMA;
  subtypes = ['vet', 'groomer', 'diagnostic_tech'];

  get profile() {
    return this.profileService.profile();
  }

  get loading() {
    return this.profileService.loading();
  }

  constructor() {
    effect(() => {
      const data = this.profile;

      if (!data || !this.form) return;

      this.form.patchValue({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        mobileSubtype: data.mobileSubtype || '',
        coverageDistricts: data.coverageDistricts || [],
        hasVehicle: data.hasVehicle || false,
        vehiclePlate: data.vehiclePlate || '',
        specialty: data.specialty || '',
      });
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      mobileSubtype: ['', Validators.required],
      coverageDistricts: [[], Validators.required],
      hasVehicle: [false],
      vehiclePlate: [''],
      specialty: [''],
    });

    this.configureVehiclePlateValidation();
    this.profileService.loadProfile();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.error('Completa los campos obligatorios');
      return;
    }

    const formValue = this.form.getRawValue();

    const profileData = {
      name: formValue.name || '',
      email: formValue.email || '',
      phone: formValue.phone || '',
      mobileSubtype: formValue.mobileSubtype || '',
      coverageDistricts: formValue.coverageDistricts || [],
      hasVehicle: formValue.hasVehicle || false,
      vehiclePlate: formValue.hasVehicle ? formValue.vehiclePlate || '' : '',
      specialty: formValue.specialty || '',
    };

    this.profileService.updateProfile(profileData as any);
    this.notification.success('Perfil actualizado correctamente');
  }

  goBack(): void {
    this.router.navigate(['/mobile/dashboard']);
  }

  private configureVehiclePlateValidation(): void {
    this.form.get('hasVehicle')?.valueChanges.subscribe((hasVehicle) => {
      const vehiclePlateControl = this.form.get('vehiclePlate');

      if (!vehiclePlateControl) return;

      if (hasVehicle) {
        vehiclePlateControl.setValidators([Validators.required]);
      } else {
        vehiclePlateControl.clearValidators();
        vehiclePlateControl.setValue('');
      }

      vehiclePlateControl.updateValueAndValidity();
    });
  }
}
