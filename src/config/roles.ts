export type UserRole = 
  | 'ADMIN' 
  | 'CREATIVE HEAD' 
  | 'DM EXECUTIVE'
  | 'DM HEAD'
  | 'CONTENT WRITER'
  | 'CREATIVE TEAM HEAD'
  | 'CREATIVE DESIGNERS'
  | 'SALES' 
  | 'PM' 
  | 'CREATIVE' 
  | 'FINANCE' 
  | 'CLIENT' 
  | 'ADS_OP'
  | 'ANALYST';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}