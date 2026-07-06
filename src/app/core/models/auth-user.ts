export type UserRole = 'customer' | 'advisor';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}
