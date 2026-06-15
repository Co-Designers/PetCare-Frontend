import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
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
    TranslatePipe,
  ],
  templateUrl: './mobile-service-form.html',
  styleUrls: ['./mobile-service-form.css'],
})
export class MobileServiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private serviceService = inject(MobileServiceService);
  private dialogRef = inject(MatDialogRef<MobileServiceFormComponent>);
  private data: { mode: 'create' | 'edit'; service?: any } = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  isEditMode = this.data.mode === 'edit';

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      durationMinutes: [30, [Validators.required, Validators.min(5)]],
      price: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
    });
    if (this.isEditMode && this.data.service) {
      this.form.patchValue(this.data.service);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const serviceData = this.form.value;
    if (this.isEditMode && this.data.service) {
      this.serviceService.updateService(this.data.service.id, serviceData);
    } else {
      this.serviceService.createService(serviceData);
    }
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
