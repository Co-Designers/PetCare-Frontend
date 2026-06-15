import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IamApiService } from '../infrastructure/iam-api';
import { SignInCommand } from '../domain/model/sign-in-command';
import { SignUpCommand } from '../domain/model/sign-up-command';
import { UserType } from '../domain/model/user-type-enum';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IamStore {
  private iamApi = inject(IamApiService);

  // Estado interno
  private isSignedInSignal = signal(false);
  private currentUserIdSignal = signal<number | null>(null);
  private currentUsernameSignal = signal<string | null>(null);
  private currentUserTypeSignal = signal<UserType | null>(null);
  private errorMessageSignal = signal<string | null>(null);

  // Exposición pública
  readonly isSignedIn = this.isSignedInSignal.asReadonly();
  readonly currentUserId = this.currentUserIdSignal.asReadonly();
  readonly currentUsername = this.currentUsernameSignal.asReadonly();
  readonly currentUserType = this.currentUserTypeSignal.asReadonly();
  readonly errorMessage = this.errorMessageSignal.asReadonly();

  // Token computado desde localStorage
  readonly currentToken = computed(() => localStorage.getItem('token'));

  constructor() {
    // En modo desarrollo forzar limpieza completa de localStorage para evitar
    // datos residuales (tokens, userId, username, userType, etc.). Esto ayuda
    // a probar login/logout sin que sesiones previas interfieran.
    if (!environment.production) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('userType');
        // Borrar todo para asegurar un estado completamente limpio en dev
        localStorage.clear();
      } catch (e) {
        console.warn('No se pudo limpiar localStorage en modo desarrollo', e);
      }
      // Asegurar señales en estado no autenticado
      this.isSignedInSignal.set(false);
      this.currentUserIdSignal.set(null);
      this.currentUsernameSignal.set(null);
      this.currentUserTypeSignal.set(null);
    } else {
      // En producción restaurar sesión desde localStorage
      this.restoreSession();
    }
  }

  private restoreSession(): void {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const userType = localStorage.getItem('userType') as UserType | null;

    if (token && userId && username && userType) {
      this.isSignedInSignal.set(true);
      this.currentUserIdSignal.set(Number(userId));
      this.currentUsernameSignal.set(username);
      this.currentUserTypeSignal.set(userType);
    }
  }

  signIn(command: SignInCommand, router: Router): void {
    this.iamApi.signIn(command).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.id.toString());
        localStorage.setItem('username', res.username);
        localStorage.setItem('userType', res.userType);

        this.isSignedInSignal.set(true);
        this.currentUserIdSignal.set(res.id);
        this.currentUsernameSignal.set(res.username);
        this.currentUserTypeSignal.set(res.userType as UserType);
        this.errorMessageSignal.set(null);

        this.navigateByUserType(router, res.userType);
      },
      error: () => {
        this.errorMessageSignal.set('Invalid username or password');
        this.isSignedInSignal.set(false);
        this.clearLocalState();
        router.navigate(['/iam/sign-in']);
      },
    });
  }

  signUp(command: SignUpCommand, router: Router): void {
    this.iamApi.signUp(command).subscribe({
      next: () => {
        router.navigate(['/iam/sign-in'], { queryParams: { registered: 'true' } });
      },
      error: () => {
        this.errorMessageSignal.set('Sign-up failed. Try a different username or email.');
        router.navigate(['/iam/sign-up']);
      },
    });
  }

  signOut(router: Router): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userType');
    this.isSignedInSignal.set(false);
    this.clearLocalState();
    router.navigate(['/iam/sign-in']);
  }

  private clearLocalState(): void {
    this.currentUserIdSignal.set(null);
    this.currentUsernameSignal.set(null);
    this.currentUserTypeSignal.set(null);
  }

  private navigateByUserType(router: Router, userType: string): void {
    switch (userType) {
      case UserType.OWNER:
        router.navigate(['/owner/dashboard']);
        break;
      case UserType.CLINIC:
        router.navigate(['/clinic/dashboard']);
        break;
      case UserType.MOBILE:
        router.navigate(['/mobile/dashboard']);
        break;
      default:
        router.navigate(['/']);
        break;
    }
  }
}
