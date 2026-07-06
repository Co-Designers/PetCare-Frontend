import { Routes } from '@angular/router';
import { roleGuard } from '../../iam/presentation/guards/role-guard';

export const mobileRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/mobile-dashboard/mobile-dashboard').then(
        (m) => m.MobileDashboardComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'MOBILE' },
    title: 'PetCare - Mobile Dashboard',
  },
  {
    path: 'requests',
    loadComponent: () =>
      import('./components/mobile-request-list/mobile-request-list').then(
        (m) => m.MobileRequestListComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'MOBILE' },
    title: 'PetCare - Service Requests',
  },
  {
    path: 'requests/:id',
    loadComponent: () =>
      import('./components/mobile-request-detail/mobile-request-detail').then(
        (m) => m.MobileRequestDetailComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'MOBILE' },
    title: 'PetCare - Request Details',
  },
  {
    path: 'availability',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./components/mobile-service-list/mobile-service-list').then(
        (m) => m.MobileServiceListComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'MOBILE' },
    title: 'PetCare - My Services',
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/mobile-profile/mobile-profile').then(
        (m) => m.MobileProfileComponent,
      ),
    canActivate: [roleGuard],
    data: { requiredRole: 'MOBILE' },
    title: 'PetCare - Mobile Profile',
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
