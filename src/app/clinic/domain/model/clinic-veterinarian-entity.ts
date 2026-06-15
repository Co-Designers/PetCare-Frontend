export interface ClinicVeterinarianEntity {
  id?: number;
  clinicId: number;
  name: string;
  specialty: string;
  licenseNumber: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  isActive?: boolean;
  schedule?: string;
}
