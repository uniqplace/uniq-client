import type { RoleType } from '../types/index';

export const roleOptions: { label: string; value: RoleType }[] = [
  { label: 'Customer', value: 'customer' },
  { label: 'Manufacturer', value: 'manufacturer' },
  { label: 'Creator', value: 'creator' },
  { label: 'Admin', value: 'admin' },
];