import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ClinicPatientService } from '../../../application/clinic-patient';

@Component({
  selector: 'app-clinic-patient-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './clinic-patient-list.html',
  styleUrls: ['./clinic-patient-list.css'],
})
export class ClinicPatientListComponent implements OnInit {
  private patientService = inject(ClinicPatientService);

  get patients() {
    return this.patientService.patients();
  }
  get loading() {
    return this.patientService.loading();
  }

  ngOnInit(): void {
    this.patientService.loadPatients();
  }
}
