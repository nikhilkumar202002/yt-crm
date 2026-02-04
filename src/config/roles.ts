export type UserRole = 
  | 'ADMIN' 
  | 'SALES' 
  | 'PM' 
  | 'CREATIVE' 
  | 'CREATIVE HEAD' // New role
  | 'DM HEAD'       // New role
  | 'DM EXECUTIVE'  // New role
  | 'CONTENT WRITER' // New role
  | 'FINANCE' 
  | 'CLIENT' 
  | 'ADS_OP'        // Used in menu.ts
  | 'ANALYST';       // Used in menu.ts

export interface User {
  id: string;
  name: string;
  role: UserRole;
}