export interface OwnerServiceProviderEntity {
  id: number;
  type: 'clinic' | 'mobile';
  name: string;
  email: string;
  phone: string;
  address?: string;
  district: string;
  specialties?: string[];
  servicesOffered?: string[];
  rating?: number;
  openingHours?: string;

  // Campos específicos para profesional móvil
  mobileSubtype?: 'vet' | 'groomer' | 'diagnostic_tech';
  coverageDistricts?: string[];
  hasVehicle?: boolean;
  vehiclePlate?: string;
}
