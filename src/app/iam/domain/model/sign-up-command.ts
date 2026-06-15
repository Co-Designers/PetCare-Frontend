import { UserType } from './user-type-enum';
import { MobileSubtype } from './mobile-subtype-enum';

export class SignUpCommand {
  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly email: string,
    public readonly userType: UserType,
    public readonly fullName: string,
    public readonly phone: string,

    // OWNER
    public readonly district?: string,

    // CLINIC
    public readonly clinicName?: string,
    public readonly ruc?: string,
    public readonly address?: string,
    public readonly clinicType?: string,

    // MOBILE
    public readonly mobileSubtype?: MobileSubtype,
    public readonly coverageDistricts?: string[],
    public readonly hasVehicle?: boolean,
    public readonly vehiclePlate?: string,
    public readonly specialty?: string,
  ) {}
}
