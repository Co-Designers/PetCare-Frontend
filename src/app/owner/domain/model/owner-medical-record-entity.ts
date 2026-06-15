export interface OwnerMedicalRecordEntity {
  id?: number;
  petId: number;
  appointmentId?: number;
  date: string;
  veterinarianName?: string;
  clinicName?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  observations?: string;
  vaccinationName?: string;
  nextDueDate?: string;
  documentUrls?: string[];
}
