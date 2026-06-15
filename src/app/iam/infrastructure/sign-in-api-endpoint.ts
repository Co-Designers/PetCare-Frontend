import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SignInCommand } from '../domain/model/sign-in-command';
import { SignInAssembler } from './sign-in-assembler';
import { SignInResponse } from './sign-in-response';

@Injectable({ providedIn: 'root' })
export class SignInApiEndpoint {
  private http = inject(HttpClient);
  private assembler = inject(SignInAssembler);
  private url = `${environment.platformProviderApiBaseUrl}/authentication/sign-in`;

  execute(command: SignInCommand): Observable<SignInResponse> {
    const request = this.assembler.toRequest(command);
    return this.http
      .post(this.url, request)
      .pipe(map((raw: any) => this.assembler.toResponse(raw)));
  }
}
