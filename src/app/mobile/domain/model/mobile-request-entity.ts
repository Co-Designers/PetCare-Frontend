export interface MobileRequestEntity {
  id?: number;
  mobileId: number;
  ownerId: number;
  petId: number;
  serviceId: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  scheduledDateTime?: string; // ISO datetime
  address: string;
  notes?: string;
  createdAt: string; // ISO datetime
}
