import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IamStore } from '../../application/iam-store';

export const roleGuard: CanActivateFn = (route) => {
  const store = inject(IamStore);
  const router = inject(Router);
  const requiredRole = route.data['requiredRole'];
  const userRole = store.currentUserType();

  if (store.isSignedIn() && userRole === requiredRole) {
    return true;
  }

  router.navigate(['/iam/sign-in']);
  return false;
};
