import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SignInCommand } from '../domain/model/sign-in-command';
import { SignUpCommand } from '../domain/model/sign-up-command';
import { SignInApiEndpoint } from './sign-in-api-endpoint';
import { SignUpApiEndpoint } from './sign-up-api-endpoint';
import { SignInResponse } from './sign-in-response';
import { SignUpResponse } from './sign-up-response';

@Injectable({ providedIn: 'root' })
export class IamApiService {
  private signInEndpoint = inject(SignInApiEndpoint);
  private signUpEndpoint = inject(SignUpApiEndpoint);

  signIn(command: SignInCommand): Observable<SignInResponse> {
    return this.signInEndpoint.execute(command);
  }

  signUp(command: SignUpCommand): Observable<SignUpResponse> {
    return this.signUpEndpoint.execute(command);
  }
}
