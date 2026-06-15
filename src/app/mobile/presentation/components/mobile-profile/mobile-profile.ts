import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { MobileProfessionalService } from '../../../application/mobile-professional';
import { NotificationService } from '../../../../shared/application/notification';
import { DISTRICTS_LIMA } from '../../../../shared/constants/districts';

@Component({
  selector: 'app-mobile-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    TranslatePipe,
  ],
  templateUrl: './mobile-profile.html',
  styleUrls: ['./mobile-profile.css'],
})
export class MobileProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(MobileProfessionalService);
  private router = inject(Router);
  private notification = inject(NotificationService);

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
      if (data) {
        this.form.patchValue({
          name: data.name,
          email: data.email,
          phone: data.phone,
          mobileSubtype: data.mobileSubtype,
          coverageDistricts: data.coverageDistricts,
          hasVehicle: data.hasVehicle,
          vehiclePlate: data.vehiclePlate,
          specialty: data.specialty,
        });
      }
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
    this.profileService.loadProfile();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.profileService.updateProfile(this.form.value);
  }

  goBack(): void {
    this.router.navigate(['/mobile/dashboard']);
  }
}
