export type UserRole = 'ADMIN' | 'SALES' | 'PM' | 'CREATIVE' | 'FINANCE' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}