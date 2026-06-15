import { Routes } from '@angular/router';
import { roleGuard } from '../../iam/presentation/guards/role-guard';

export const ownerRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/owner-dashboard/owner-dashboard').then(
        (m) => m.OwnerDashboardComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'OWNER' },
    title: 'PetCare - Owner Dashboard',
  },
  {
    path: 'pets',
    loadComponent: () =>
      import('./components/owner-pet-list/owner-pet-list').then(
        (m) => m.OwnerPetListComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'OWNER' },
    title: 'PetCare - My Pets',
  },
  {
    path: 'pets/new',
    loadComponent: () =>
      import('./components/owner-pet-form/owner-pet-form').then(
        (m) => m.OwnerPetFormComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'OWNER' },
    title: 'PetCare - Add Pet',
  },
  {
    path: 'pets/edit/:id',
    loadComponent: () =>
      import('./components/owner-pet-form/owner-pet-form').then(
        (m) => m.OwnerPetFormComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'OWNER' },
    title: 'PetCare - Edit Pet',
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./components/owner-appointment-list/owner-appointment-list').then(
        (m) => m.OwnerAppointmentListComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'OWNER' },
    title: 'PetCare - My Appointments',
  },
  {
    path: 'appointments/new',
    loadComponent: () =>
      import('./components/owner-appointment-form/owner-appointment-form').then(
        (m) => m.OwnerAppointmentFormComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'OWNER' },
    title: 'PetCare - New Appointment',
  },
  {
    path: 'appointments/edit/:id',
    loadComponent: () =>
      import('./components/owner-appointment-form/owner-appointment-form').then(
        (m) => m.OwnerAppointmentFormComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'OWNER' },
    title: 'PetCare - Edit Appointment',
  },
  {
    path: 'medical-history/:petId',
    loadComponent: () =>
      import('./components/owner-medical-history/owner-medical-history').then(
        (m) => m.OwnerMedicalHistoryComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'OWNER' },
    title: 'PetCare - Medical History',
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/owner-search-page/owner-search-page').then(m => m.OwnerSearchPageComponent),
    canActivate: [roleGuard],
    data: { requiredRole: 'OWNER' }
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./components/owner-search-filters/owner-search-filters').then(
        (m) => m.OwnerSearchFiltersComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'OWNER' },
    title: 'PetCare - Search Services',
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/owner-profile/owner-profile').then(
        (m) => m.OwnerProfileComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'OWNER' },
    title: 'PetCare - My Profile',
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
