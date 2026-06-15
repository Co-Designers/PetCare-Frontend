import { Routes } from '@angular/router';
import { roleGuard } from '../../iam/presentation/guards/role-guard';

export const clinicRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/clinic-dashboard/clinic-dashboard').then(
        (m) => m.ClinicDashboardComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'CLINIC' },
    title: 'PetCare - Clinic Dashboard',
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./components/clinic-appointment-list/clinic-appointment-list').then(
        (m) => m.ClinicAppointmentListComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'CLINIC' },
    title: 'PetCare - Clinic Appointments',
  },
  {
    path: 'appointments/:id',
    loadComponent: () =>
      import('./components/clinic-appointment-detail/clinic-appointment-detail').then(
        (m) => m.ClinicAppointmentDetailComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'CLINIC' },
    title: 'PetCare - Appointment Details',
  },
  {
    path: 'appointments/new',
    loadComponent: () =>
      import('./components/clinic-appointment-form/clinic-appointment-form').then(
        (m) => m.ClinicAppointmentFormComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'CLINIC' },
    title: 'PetCare - New Appointment',
  },
  {
    path: 'patients',
    loadComponent: () =>
      import('./components/clinic-patient-list/clinic-patient-list').then(
        (m) => m.ClinicPatientListComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'CLINIC' },
    title: 'PetCare - Clinic Patients',
  },
  {
    path: 'patients/:id',
    loadComponent: () =>
      import('./components/clinic-patient-detail/clinic-patient-detail').then(
        (m) => m.ClinicPatientDetailComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'CLINIC' },
    title: 'PetCare - Patient Details',
  },
  {
    path: 'veterinarians',
    loadComponent: () =>
      import('./components/clinic-veterinarian-list/clinic-veterinarian-list').then(
        (m) => m.ClinicVeterinarianListComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'CLINIC' },
    title: 'PetCare - Clinic Veterinarians',
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./components/clinic-service-list/clinic-service-list').then(
        (m) => m.ClinicServiceListComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'CLINIC' },
    title: 'PetCare - Clinic Services',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/clinic-settings/clinic-settings').then((m) => m.ClinicSettingsComponent),
    canActivate: [roleGuard],
    data: { requiredRole: 'CLINIC' },
    title: 'PetCare - Clinic Settings',
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
