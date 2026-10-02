import { UserRole } from '../types';

export type ProtectedPageId =
  | 'home'
  | 'dashboard'
  | 'appointments'
  | 'patients'
  | 'doctors'
  | 'medical-records'
  | 'billing'
  | 'settings';

export const ROLE_PAGE_ACCESS: Record<UserRole, ProtectedPageId[]> = {
  administrator: ['home', 'dashboard', 'appointments', 'patients', 'doctors', 'medical-records', 'billing', 'settings'],
  doctor: ['home', 'appointments', 'patients', 'medical-records'],
  receptionist: ['home', 'dashboard', 'appointments', 'patients', 'billing'],
  patient: ['home', 'appointments', 'patients', 'doctors', 'medical-records', 'billing'],
};

export function canAccessPage(role: UserRole, page: ProtectedPageId): boolean {
  return ROLE_PAGE_ACCESS[role].includes(page);
}