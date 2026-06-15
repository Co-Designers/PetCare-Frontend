export interface MobileProfessionalEntity {
  id?: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  mobileSubtype: 'vet' | 'groomer' | 'diagnostic_tech';
  coverageDistricts: string[];
  hasVehicle: boolean;
  vehiclePlate?: string;
  specialty?: string;
  rating?: number;
  isActive?: boolean;
}
