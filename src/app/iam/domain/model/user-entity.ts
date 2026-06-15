import { UserType } from './user-type-enum';

export interface UserEntity {
  id: number;
  username: string;
  email: string;
  userType: UserType;
}
