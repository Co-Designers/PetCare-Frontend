import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
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
    TranslatePipe,
  ],
  templateUrl: './clinic-settings.html',
  styleUrls: ['./clinic-settings.css'],
})
export class ClinicSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clinicService = inject(ClinicClinicService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  get clinic() {
    return this.clinicService.clinic();
  }
  get loading() {
    return this.clinicService.loading();
  }
  districts = DISTRICTS_LIMA;

  constructor() {
    effect(() => {
      const data = this.clinic;
      if (data) {
        this.form.patchValue({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          district: data.district,
          description: data.description || '',
          openingHours: data.openingHours || '',
        });
      }
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      district: ['', Validators.required],
      description: [''],
      openingHours: [''],
    });
    this.clinicService.loadClinicProfile();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.clinicService.updateProfile(this.form.value);
  }
}
