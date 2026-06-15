import { Injectable } from '@angular/core';
import { SignInCommand } from '../domain/model/sign-in-command';
import { SignInRequest } from './sign-in-request';
import { SignInResponse } from './sign-in-response';

@Injectable({ providedIn: 'root' })
export class SignInAssembler {
  toRequest(command: SignInCommand): SignInRequest {
    return { username: command.username, password: command.password };
  }

  toResponse(raw: any): SignInResponse {
    return {
      id: raw.id,
      username: raw.username,
      email: raw.email,
      userType: raw.userType,
      token: raw.token,
    };
  }
}
