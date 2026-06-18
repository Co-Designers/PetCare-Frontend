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
  private readonly patientService = inject(ClinicPatientService);

  get patients() {
    return this.patientService.patients();
  }

  get loading() {
    return this.patientService.loading();
  }

  ngOnInit(): void {
    this.patientService.loadPatients();
  }

  getPatientPhoto(patient: any): string {
    return patient?.photoUrl || 'assets/default-pet.png';
  }

  getPatientSubtitle(patient: any): string {
    const species = patient?.species || 'Mascota';
    const breed = patient?.breed;

    if (!breed) return species;

    return `${species} · ${breed}`;
  }

  getOwnerLabel(patient: any): string {
    if (patient?.ownerName) return patient.ownerName;
    if (patient?.ownerId) return `ID: ${patient.ownerId}`;

    return 'No asignado';
  }

  getLastVisitLabel(patient: any): string {
    if (!patient?.lastVisit) return 'Sin visitas registradas';

    const date = new Date(patient.lastVisit);

    if (Number.isNaN(date.getTime())) {
      return String(patient.lastVisit);
    }

    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getWeightLabel(patient: any): string {
    const weight = patient?.weight;

    if (weight === null || weight === undefined || weight === '') {
      return 'No registrado';
    }

    return `${weight} kg`;
  }

  getAllergiesLabel(patient: any): string {
    const allergies = patient?.allergies;

    if (!allergies) return 'Sin alergias registradas';

    if (Array.isArray(allergies)) {
      return allergies.length > 0 ? allergies.join(', ') : 'Sin alergias registradas';
    }

    return String(allergies);
  }

  getPatientsWithLastVisit(): number {
    return this.patients.filter((patient: any) => !!patient?.lastVisit).length;
  }

  getPatientsWithOwner(): number {
    return this.patients.filter((patient: any) => !!patient?.ownerName || !!patient?.ownerId)
      .length;
  }
}
