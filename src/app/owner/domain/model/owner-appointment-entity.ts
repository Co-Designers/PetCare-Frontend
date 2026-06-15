export interface OwnerAppointmentEntity {
  id?: number;
  petId: number;
  providerId: number; // ID de la clínica o profesional móvil
  providerType: 'clinic' | 'mobile';
  serviceType: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  notes?: string;
  createdAt?: string;
}
