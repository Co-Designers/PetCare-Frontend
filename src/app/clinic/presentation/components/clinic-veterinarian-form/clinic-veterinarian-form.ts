import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { ClinicVeterinarianService } from '../../../application/clinic-veterinarian';

@Component({
  selector: 'app-clinic-veterinarian-form',
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
  templateUrl: './clinic-veterinarian-form.html',
  styleUrls: ['./clinic-veterinarian-form.css'],
})
export class ClinicVeterinarianFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vetService = inject(ClinicVeterinarianService);
  private dialogRef = inject(MatDialogRef<ClinicVeterinarianFormComponent>);
  private data: { mode: 'create' | 'edit'; veterinarian?: any } = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  isEditMode = this.data.mode === 'edit';

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      specialty: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: [''],
      isActive: [true],
    });
    if (this.isEditMode && this.data.veterinarian) {
      this.form.patchValue(this.data.veterinarian);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const vetData = this.form.value;
    if (this.isEditMode && this.data.veterinarian) {
      this.vetService.updateVeterinarian(this.data.veterinarian.id, vetData);
    } else {
      this.vetService.createVeterinarian(vetData);
    }
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
