import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SignUpCommand } from '../domain/model/sign-up-command';
import { SignUpAssembler } from './sign-up-assembler';
import { SignUpResponse } from './sign-up-response';

@Injectable({ providedIn: 'root' })
export class SignUpApiEndpoint {
  private http = inject(HttpClient);
  private assembler = inject(SignUpAssembler);
  private url = `${environment.platformProviderApiBaseUrl}/authentication/sign-up`;

  execute(command: SignUpCommand): Observable<SignUpResponse> {
    const request = this.assembler.toRequest(command);
    return this.http
      .post(this.url, request)
      .pipe(map((raw: any) => this.assembler.toResponse(raw)));
  }
}
