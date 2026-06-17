import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/presentation/components/layout/layout';
import { iamGuard } from './iam/infrastructure/iam-guard';

const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);

const iamRoutes = () => import('./iam/presentation/iam.routes').then((m) => m.iamRoutes);

export const routes: Routes = [
  // Ruta inicial: siempre manda al login
  {
    path: '',
    redirectTo: 'iam/sign-in',
    pathMatch: 'full',
  },

  // Rutas públicas sin layout
  {
    path: 'iam',
    loadChildren: iamRoutes,
  },

  // Rutas protegidas con layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [iamGuard],
    children: [
      {
        path: 'owner',
        loadChildren: () => import('./owner/presentation/owner-routes').then((m) => m.ownerRoutes),
      },
      {
        path: 'clinic',
        loadChildren: () =>
          import('./clinic/presentation/clinic-routes').then((m) => m.clinicRoutes),
      },
      {
        path: 'mobile',
        loadChildren: () =>
          import('./mobile/presentation/mobile-routes').then((m) => m.mobileRoutes),
      },
    ],
  },

  // Página 404
  {
    path: '**',
    loadComponent: pageNotFound,
  },
];
