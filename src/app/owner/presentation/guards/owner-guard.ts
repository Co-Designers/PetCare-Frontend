import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IamStore } from '../../../iam/application/iam-store';

export const ownerGuard: CanActivateFn = () => {
  const store = inject(IamStore);
  const router = inject(Router);
  const isSignedIn = store.isSignedIn();
  const userType = store.currentUserType();

  if (isSignedIn && userType === 'OWNER') {
    return true;
  }
  router.navigate(['/iam/sign-in']);
  return false;
};
