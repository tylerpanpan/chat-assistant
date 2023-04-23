import { SetMetadata } from '@nestjs/common';

export enum Role {
  Guest = 'guest',
  User = 'normal',
  Admin = 'admin',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
