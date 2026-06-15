import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { ClinicPatientService } from '../../../application/clinic-patient';
import { NotificationService } from '../../../../shared/application/notification';

@Component({
  selector: 'app-clinic-patient-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, TranslatePipe],
  templateUrl: './clinic-patient-detail.html',
  styleUrls: ['./clinic-patient-detail.css'],
})
export class ClinicPatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientService = inject(ClinicPatientService);
  private notification = inject(NotificationService);

  patient: any = null;
  loading = true;

  // Exponer señales del servicio
  get medicalRecords() {
    return this.patientService.medicalRecords();
  }
  get loadingRecords() {
    return this.patientService.loadingRecords();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.patientService.getPatientById(id).subscribe({
        next: (data) => {
          this.patient = data;
          this.loading = false;
          // Llamar al método que carga el historial (no devuelve observable)
          this.patientService.loadMedicalRecords(id);
        },
        error: () => {
          this.notification.error('Error al cargar paciente');
          this.router.navigate(['/clinic/patients']).then();
        },
      });
    }
  }
}
