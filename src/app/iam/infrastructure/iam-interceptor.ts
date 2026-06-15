import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { IamStore } from '../application/iam-store';

export const iamInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(IamStore);
  const skipAuthUrls = ['/authentication/sign-in', '/authentication/sign-up', '/assets/i18n/'];
  if (skipAuthUrls.some((url) => req.url.includes(url))) {
    return next(req);
  }
  const token = store.currentToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
