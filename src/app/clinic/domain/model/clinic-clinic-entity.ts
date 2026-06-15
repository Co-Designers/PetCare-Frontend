export interface ClinicClinicEntity {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  ruc?: string;
  clinicType?: 'General' | 'Specialized' | 'Emergency 24h' | 'Laboratory';
  description?: string;
  logoUrl?: string;
  openingHours?: string;
  servicesOffered?: string[];
  specialties?: string[];
  rating?: number;
}
