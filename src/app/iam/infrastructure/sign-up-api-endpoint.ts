import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SignUpCommand } from '../domain/model/sign-up-command';
import { UserType } from '../domain/model/user-type-enum';
import { SignUpAssembler } from './sign-up-assembler';
import { SignUpResponse } from './sign-up-response';

@Injectable({ providedIn: 'root' })
export class SignUpApiEndpoint {
  private http = inject(HttpClient);
  private assembler = inject(SignUpAssembler);

  execute(command: SignUpCommand): Observable<SignUpResponse> {
    const request = this.assembler.toRequest(command);
    const url = this.resolveUrl(command.userType);
    return this.http
      .post(url, request)
      .pipe(map((raw: any) => this.assembler.toResponse(raw)));
  }

  private resolveUrl(userType: UserType): string {
    const baseUrl = `${environment.platformProviderApiBaseUrl}/authentication/sign-up`;

    switch (userType) {
      case UserType.OWNER:
        return `${baseUrl}/owner`;
      case UserType.CLINIC:
        return `${baseUrl}/clinic`;
      case UserType.MOBILE:
        return `${baseUrl}/mobile-professional`;
      default:
        return baseUrl;
    }
  }
}
