import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

import { TranslatePipe } from '@ngx-translate/core';

import { MobileAvailabilityService } from '../../../application/mobile-availability';
import { NotificationService } from '../../../../shared/application/notification';

@Component({
  selector: 'app-mobile-availability-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './mobile-availability-form.html',
  styleUrls: ['./mobile-availability-form.css'],
})
export class MobileAvailabilityFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly availabilityService = inject(MobileAvailabilityService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  form!: FormGroup;

  minDate = new Date().toISOString().split('T')[0];
  timeRangeError = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      isAvailable: [true],
    });

    this.form.valueChanges.subscribe(() => {
      this.timeRangeError = false;
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.error('Completa los campos obligatorios');
      return;
    }

    if (!this.isValidTimeRange()) {
      this.timeRangeError = true;
      this.notification.error('La hora de fin debe ser mayor que la hora de inicio');
      return;
    }

    const formValue = this.form.getRawValue();

    const slot = {
      date: formValue.date,
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      isAvailable: formValue.isAvailable !== false,
    };

    this.availabilityService.createSlot(slot as any);
    this.notification.success('Disponibilidad guardada');

    this.form.reset({
      date: '',
      startTime: '',
      endTime: '',
      isAvailable: true,
    });
  }

  onCancel(): void {
    this.router.navigate(['/mobile/dashboard']);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && control.touched;
  }

  private isValidTimeRange(): boolean {
    const startTime = this.form.get('startTime')?.value;
    const endTime = this.form.get('endTime')?.value;

    if (!startTime || !endTime) return false;

    return endTime > startTime;
  }
}
