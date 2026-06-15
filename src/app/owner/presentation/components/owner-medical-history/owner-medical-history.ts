import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { OwnerMedicalRecordService } from '../../../application/owner-medical-record';
import { OwnerPetService } from '../../../application/owner-pet';

@Component({
  selector: 'app-owner-medical-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './owner-medical-history.html',
  styleUrls: ['./owner-medical-history.css'],
})
export class OwnerMedicalHistoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private medicalService = inject(OwnerMedicalRecordService);
  private petService = inject(OwnerPetService);

  petId!: number;
  petName = '';
  get records() {
    return this.medicalService.records();
  }
  get loading() {
    return this.medicalService.loading();
  }

  ngOnInit(): void {
    this.petId = +this.route.snapshot.params['petId'];
    this.petService.loadPets();
    this.medicalService.loadRecords(this.petId);
    const pet = this.petService.pets().find((p) => p.id === this.petId);
    this.petName = pet?.name || 'Mascota';
  }

  exportHistory(): void {
    alert('Próximamente – exportar a PDF');
  }

  shareTemporarily(): void {
    alert('Próximamente – compartir enlace temporal');
  }
}
