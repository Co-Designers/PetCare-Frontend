import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { TranslatePipe } from '@ngx-translate/core';

import { MobileServiceService } from '../../../application/mobile-service';

@Component({
  selector: 'app-mobile-service-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    TranslatePipe,
  ],
  templateUrl: './mobile-service-form.html',
  styleUrls: ['./mobile-service-form.css'],
})
export class MobileServiceFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly serviceService = inject(MobileServiceService);
  private readonly dialogRef = inject(MatDialogRef<MobileServiceFormComponent>);
  private readonly data: { mode: 'create' | 'edit'; service?: any } = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  isEditMode = this.data.mode === 'edit';

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      durationMinutes: [30, [Validators.required, Validators.min(5)]],
      price: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
    });

    if (this.isEditMode && this.data.service) {
      this.form.patchValue({
        name: this.data.service.name || '',
        description: this.data.service.description || '',
        durationMinutes: this.data.service.durationMinutes || this.data.service.duration || 30,
        price: this.data.service.price || 0,
        isActive: this.data.service.isActive !== false,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    const serviceData = {
      name: formValue.name || '',
      description: formValue.description || '',
      durationMinutes: Number(formValue.durationMinutes || 0),
      price: Number(formValue.price || 0),
      isActive: formValue.isActive !== false,
    };

    if (this.isEditMode && this.data.service?.id) {
      this.serviceService.updateService(this.data.service.id, serviceData as any);
    } else {
      this.serviceService.createService(serviceData as any);
    }

    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
