import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MobileAvailabilityService } from '../../../application/mobile-availability';
import { NotificationService } from '../../../../shared/application/notification';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-mobile-availability-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslatePipe,
    MatCheckbox,
  ],
  templateUrl: './mobile-availability-form.html',
  styleUrls: ['./mobile-availability-form.css'],
})
export class MobileAvailabilityFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private availabilityService = inject(MobileAvailabilityService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  form!: FormGroup;
  minDate = new Date();

  ngOnInit(): void {
    this.form = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      isAvailable: [true],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const slot = this.form.value;
    this.availabilityService.createSlot(slot);
    this.notification.success('Disponibilidad guardada');
    this.form.reset({ isAvailable: true });
  }

  onCancel(): void {
    this.router.navigate(['/mobile/dashboard']);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && control.touched;
  }
}
