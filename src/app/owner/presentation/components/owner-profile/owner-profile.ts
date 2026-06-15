import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { OwnerUserProfileService } from '../../../application/owner-user-profile';
import { DISTRICTS_LIMA } from '../../../../shared/constants/districts';
import { NotificationService } from '../../../../shared/application/notification';

@Component({
  selector: 'app-owner-profile',
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
  templateUrl: './owner-profile.html',
  styleUrls: ['./owner-profile.css'],
})
export class OwnerProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(OwnerUserProfileService);
  private notification = inject(NotificationService);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  get profile() {
    return this.profileService.profile();
  }
  get loading() {
    return this.profileService.loading();
  }
  districts = DISTRICTS_LIMA;

  constructor() {
    effect(() => {
      const data = this.profile;
      if (data) {
        this.profileForm.patchValue({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          district: data.district,
        });
      }
    });
  }

  ngOnInit(): void {
    this.buildForms();
    this.profileService.loadProfile();
  }

  private buildForms(): void {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      district: ['', Validators.required],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(group: FormGroup): any {
    const newPass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return newPass === confirm ? null : { mismatch: true };
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;
    this.profileService.updateProfile(this.profileForm.value);
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.profileService.changePassword(currentPassword, newPassword);
    this.passwordForm.reset();
  }
}
