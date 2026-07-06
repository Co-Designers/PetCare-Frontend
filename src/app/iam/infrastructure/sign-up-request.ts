export interface SignUpRequest {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  fullName: string;
  phone: string;
  district?: string;
  clinicName?: string;
  ruc?: string;
  address?: string;
  clinicType?: string;
  mobileSubtype?: string;
  coverageDistricts?: string[];
  hasVehicle?: boolean;
  vehiclePlate?: string;
  specialty?: string;
}
