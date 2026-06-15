export interface TimeSlotEntity {
  id?: number;
  mobileId: number;
  date: string; // formato YYYY-MM-DD
  startTime: string; // formato HH:MM (24h)
  endTime: string;
  isAvailable: boolean;
}
