export interface MobileServiceEntity {
  id?: number;
  mobileId: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  isActive?: boolean;
}
