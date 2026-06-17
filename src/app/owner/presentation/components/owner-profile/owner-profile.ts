import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './owner-profile.html',
  styleUrls: ['./owner-profile.css'],
})
export class OwnerProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(OwnerUserProfileService);
  private readonly notification = inject(NotificationService);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  districts = DISTRICTS_LIMA;

  get profile() {
    return this.profileService.profile();
  }

  get loading() {
    return this.profileService.loading();
  }

  constructor() {
    effect(() => {
      const data = this.profile;

      if (!data || !this.profileForm) return;

      this.profileForm.patchValue({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        district: data.district || '',
      });
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

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) return null;

    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.notification.error('Completa los campos obligatorios');
      return;
    }

    this.profileService.updateProfile(this.profileForm.value);
    this.notification.success('Perfil actualizado correctamente');
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.notification.error('Revisa los campos de contraseña');
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.profileService.changePassword(currentPassword, newPassword);
    this.passwordForm.reset();
    this.notification.success('Contraseña actualizada correctamente');
  }

  isProfileFieldInvalid(field: string): boolean {
    const control = this.profileForm.get(field);
    return !!control && control.invalid && control.touched;
  }

  isPasswordFieldInvalid(field: string): boolean {
    const control = this.passwordForm.get(field);
    return !!control && control.invalid && control.touched;
  }

  getInitials(): string {
    const fullName = this.profileForm?.get('fullName')?.value || this.profile?.fullName || 'Owner';

    return fullName
      .split(' ')
      .filter((part: string) => part.trim().length > 0)
      .slice(0, 2)
      .map((part: string) => part[0].toUpperCase())
      .join('');
  }
}
