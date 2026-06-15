export interface ClinicServiceEntity {
  id?: number;
  clinicId: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  isActive?: boolean;
}
