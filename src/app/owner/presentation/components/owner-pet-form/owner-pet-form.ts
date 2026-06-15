import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';
import { OwnerPetService } from '../../../application/owner-pet';
import { IamStore } from '../../../../iam/application/iam-store';

@Component({
  selector: 'app-owner-pet-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslatePipe,
  ],
  templateUrl: './owner-pet-form.html',
  styleUrls: ['./owner-pet-form.css'],
})
export class OwnerPetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private petService = inject(OwnerPetService);
  private iamStore = inject(IamStore);
  private dialogRef = inject(MatDialogRef<OwnerPetFormComponent>);
  private data: { mode: 'create' | 'edit'; pet?: any } = inject(MAT_DIALOG_DATA);

  petForm!: FormGroup;
  isEditMode = this.data.mode === 'edit';
  speciesList = ['dog', 'cat', 'other'];

  ngOnInit(): void {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      species: ['', Validators.required],
      breed: [''],
      birthDate: [''],
      weight: ['', [Validators.min(0)]],
      allergies: [''],
    });
    if (this.isEditMode && this.data.pet) {
      this.petForm.patchValue(this.data.pet);
    }
  }

  onSubmit(): void {
    if (this.petForm.invalid) return;
    const petData = this.petForm.value;
    const ownerId = this.iamStore.currentUserId();
    if (!ownerId) return;

    if (this.isEditMode && this.data.pet?.id) {
      this.petService.updatePet(this.data.pet.id, petData);
    } else {
      this.petService.addPet({ ...petData, ownerId });
    }
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(field: string): boolean {
    const control = this.petForm.get(field);
    return !!control && control.invalid && control.touched;
  }
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.petForm.patchValue({ photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }
}
