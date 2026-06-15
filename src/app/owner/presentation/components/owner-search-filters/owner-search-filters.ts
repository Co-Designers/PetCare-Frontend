import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { DISTRICTS_LIMA } from '../../../../shared/constants/districts';

@Component({
  selector: 'app-owner-search-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    TranslatePipe,
  ],
  templateUrl: './owner-search-filters.html',
  styleUrls: ['./owner-search-filters.css'],
})
export class OwnerSearchFiltersComponent {
  private fb = inject(FormBuilder);

  districts = DISTRICTS_LIMA;
  specialties = [
    'Cardiología',
    'Odontología',
    'Dermatología',
    'Cirugía',
    'Vacunación',
    'Urgencias',
  ];
  searchEvent = output<any>();

  filtersForm = this.fb.group({
    district: [''],
    specialty: [''],
    type: [''],
  });

  search(): void {
    this.searchEvent.emit(this.filtersForm.value);
  }

  reset(): void {
    this.filtersForm.reset();
    this.searchEvent.emit({});
  }
}
