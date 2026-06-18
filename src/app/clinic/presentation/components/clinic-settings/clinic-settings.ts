import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { TranslatePipe } from '@ngx-translate/core';

import { ClinicClinicService } from '../../../application/clinic-clinic';
import { NotificationService } from '../../../../shared/application/notification';
import { DISTRICTS_LIMA } from '../../../../shared/constants/districts';

@Component({
  selector: 'app-clinic-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './clinic-settings.html',
  styleUrls: ['./clinic-settings.css'],
})
export class ClinicSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clinicService = inject(ClinicClinicService);
  private readonly notification = inject(NotificationService);

  districts = DISTRICTS_LIMA;

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: ['', Validators.required],
    district: ['', Validators.required],
    description: [''],
    openingHours: [''],
  });

  get clinic() {
    return this.clinicService.clinic();
  }

  get loading() {
    return this.clinicService.loading();
  }

  constructor() {
    effect(() => {
      const data = this.clinic;

      if (!data) return;

      this.form.patchValue({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        district: data.district || '',
        description: data.description || '',
        openingHours: data.openingHours || '',
      });
    });
  }

  ngOnInit(): void {
    this.clinicService.loadClinicProfile();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.error('Completa los campos obligatorios');
      return;
    }

    const formValue = this.form.getRawValue();

    const clinicData = {
      name: formValue.name || '',
      email: formValue.email || '',
      phone: formValue.phone || '',
      address: formValue.address || '',
      district: formValue.district || '',
      description: formValue.description || '',
      openingHours: formValue.openingHours || '',
    };

    this.clinicService.updateProfile(clinicData as any);
    this.notification.success('Configuración actualizada correctamente');
  }

  getFieldValue(fieldName: string, fallback: string): string {
    const value = this.form.get(fieldName)?.value;

    if (value === null || value === undefined || value === '') {
      return fallback;
    }

    return String(value);
  }
}
