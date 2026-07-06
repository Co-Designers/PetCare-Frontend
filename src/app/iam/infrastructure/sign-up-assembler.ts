import { Injectable } from '@angular/core';
import { SignUpCommand } from '../domain/model/sign-up-command';
import { SignUpRequest } from './sign-up-request';
import { SignUpResponse } from './sign-up-response';

@Injectable({ providedIn: 'root' })
export class SignUpAssembler {
  toRequest(command: SignUpCommand): SignUpRequest {
    return {
      username: command.username,
      password: command.password,
      confirmPassword: command.password,
      email: command.email,
      fullName: command.fullName,
      phone: command.phone,
      district: command.district,
      clinicName: command.clinicName,
      ruc: command.ruc,
      address: command.address,
      clinicType: command.clinicType,
      mobileSubtype: command.mobileSubtype,
      coverageDistricts: command.coverageDistricts,
      hasVehicle: command.hasVehicle,
      vehiclePlate: command.vehiclePlate,
      specialty: command.specialty,
    };
  }

  toResponse(raw: any): SignUpResponse {
    return {
      id: raw.id,
      username: raw.username,
      email: raw.email,
      userType: raw.userType,
    };
  }
}
