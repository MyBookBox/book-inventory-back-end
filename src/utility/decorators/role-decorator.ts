import { SetMetadata } from '@nestjs/common';

// Custom decorator to set metadata for roles on the route
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
