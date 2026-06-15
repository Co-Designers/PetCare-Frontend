export interface ClinicAppointmentEntity {
  id?: number;
  petId: number;
  clinicId: number;
  veterinarianId?: number;
  serviceType: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  notes?: string;
  createdAt?: string;
}
