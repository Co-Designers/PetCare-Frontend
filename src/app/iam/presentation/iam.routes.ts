import { Routes } from '@angular/router';

export const iamRoutes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./views/sign-in-form/sign-in-form').then((m) => m.SignInFormComponent),
  },
  {
    path: 'select-type',
    loadComponent: () =>
      import('./views/user-type-selector/user-type-selector').then(
        (m) => m.UserTypeSelectorComponent,
      ),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./views/dynamic-sign-up-form/dynamic-sign-up-form').then(
        (m) => m.DynamicSignUpFormComponent,
      ),
  },
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
];
