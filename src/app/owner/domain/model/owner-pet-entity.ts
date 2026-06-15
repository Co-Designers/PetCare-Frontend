export interface OwnerPetEntity {
  id?: number;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  birthDate?: string;
  weight?: number;
  allergies?: string;
  photoUrl?: string;
  ownerId: number;
}
