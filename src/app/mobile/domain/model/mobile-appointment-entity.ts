export interface MobileAppointmentEntity {
  id?: number;
  mobileId: number;
  ownerId: number;
  petId: number;
  serviceName: string; // puede ser desnormalizado
  scheduledDateTime: string; // ISO datetime
  address: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}
