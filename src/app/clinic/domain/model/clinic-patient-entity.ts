export interface ClinicPatientEntity {
  id: number;
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  ownerId: number;
  ownerName?: string;
  ownerPhone?: string;
  allergies?: string;
  photoUrl?: string;
  lastVisit?: string;
}
