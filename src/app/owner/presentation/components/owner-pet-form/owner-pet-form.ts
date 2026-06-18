import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './owner-pet-form.html',
  styleUrls: ['./owner-pet-form.css'],
})
export class OwnerPetFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly petService = inject(OwnerPetService);
  private readonly iamStore = inject(IamStore);
  private readonly dialogRef = inject(MatDialogRef<OwnerPetFormComponent>);
  private readonly data: { mode: 'create' | 'edit'; pet?: any } = inject(MAT_DIALOG_DATA);

  petForm!: FormGroup;
  isEditMode = this.data.mode === 'edit';

  speciesList = ['dog', 'cat', 'other'];

  maxBirthDate = new Date();
  birthStartDate = new Date(2020, 0, 1);

  ngOnInit(): void {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      species: ['', Validators.required],
      otherSpecies: [''],
      breed: [''],
      birthDate: [''],
      weight: ['', Validators.min(0)],
      allergies: [''],
      photoUrl: [''],
    });

    this.configureOtherSpeciesValidation();

    if (this.isEditMode && this.data.pet) {
      this.patchPetData(this.data.pet);
    }
  }

  onSubmit(): void {
    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      return;
    }

    const ownerId = this.iamStore.currentUserId();

    if (!ownerId) return;

    const formValue = this.petForm.getRawValue();

    const finalSpecies =
      formValue.species === 'other'
        ? String(formValue.otherSpecies || '').trim()
        : formValue.species;

    const petData = {
      name: formValue.name || '',
      species: finalSpecies || '',
      breed: formValue.breed || '',
      birthDate: formValue.birthDate || '',
      weight: formValue.weight || '',
      allergies: formValue.allergies || '',
      photoUrl: formValue.photoUrl || '',
    };

    if (this.isEditMode && this.data.pet?.id) {
      this.petService.updatePet(this.data.pet.id, petData);
    } else {
      this.petService.addPet({
        ...petData,
        ownerId,
      });
    }

    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.petForm.get(field);
    return !!control && control.invalid && control.touched;
  }

  isOtherSpeciesSelected(): boolean {
    return this.petForm?.get('species')?.value === 'other';
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.petForm.patchValue({
        photoUrl: reader.result as string,
      });
    };

    reader.readAsDataURL(file);
  }

  private configureOtherSpeciesValidation(): void {
    this.petForm.get('species')?.valueChanges.subscribe((species) => {
      const otherSpeciesControl = this.petForm.get('otherSpecies');

      if (!otherSpeciesControl) return;

      if (species === 'other') {
        otherSpeciesControl.setValidators([Validators.required, Validators.minLength(2)]);
      } else {
        otherSpeciesControl.clearValidators();
        otherSpeciesControl.setValue('');
      }

      otherSpeciesControl.updateValueAndValidity();
    });
  }

  private patchPetData(pet: any): void {
    const normalizedSpecies = String(pet?.species || '').toLowerCase();

    const isDefaultSpecies =
      normalizedSpecies === 'dog' || normalizedSpecies === 'cat' || normalizedSpecies === 'other';

    this.petForm.patchValue({
      name: pet?.name || '',
      species: isDefaultSpecies ? normalizedSpecies : 'other',
      otherSpecies: isDefaultSpecies ? '' : pet?.species || '',
      breed: pet?.breed || '',
      birthDate: pet?.birthDate || '',
      weight: pet?.weight || '',
      allergies: pet?.allergies || '',
      photoUrl: pet?.photoUrl || '',
    });
  }
}
