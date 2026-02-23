/**
 * Database Models - LEGACY FILE
 * WARNING: This file is deprecated. All database operations should use Prisma Client.
 * Import from '@/lib/prisma' instead of this file.
 * 
 * These exports are stubs to prevent build errors. They will throw runtime errors
 * if actually used, forcing migration to Prisma.
 */

// Stub exports to prevent import errors
export const GameKey: any = createStub('GameKey');
export const Staff: any = createStub('Staff');
export const StaffActivity: any = createStub('StaffActivity');
export const Transaction: any = createStub('Transaction');
export const Order: any = createStub('Order');
export const Coupon: any = createStub('Coupon');
export const GiftCard: any = createStub('GiftCard');
export const GiftCardTransaction: any = createStub('GiftCardTransaction');

function createStub(modelName: string): any {
  return {
    find: () => { throw new Error(`LEGACY: ${modelName} requires Prisma migration. Use prisma from '@/lib/prisma' instead.`); },
    findOne: () => { throw new Error(`LEGACY: ${modelName} requires Prisma migration. Use prisma from '@/lib/prisma' instead.`); },
    findById: () => { throw new Error(`LEGACY: ${modelName} requires Prisma migration. Use prisma from '@/lib/prisma' instead.`); },
    create: () => { throw new Error(`LEGACY: ${modelName} requires Prisma migration. Use prisma from '@/lib/prisma' instead.`); },
    updateOne: () => { throw new Error(`LEGACY: ${modelName} requires Prisma migration. Use prisma from '@/lib/prisma' instead.`); },
    deleteOne: () => { throw new Error(`LEGACY: ${modelName} requires Prisma migration. Use prisma from '@/lib/prisma' instead.`); },
  };
}

// Legacy interfaces for type compatibility
export interface IStaffPermission {
  permission: string;
  canPerform: boolean;
}

export interface IStaff {
  email: string;
  fullName?: string;
  password: string;
  role: 'admin' | 'supervisor' | 'staff' | 'support' | 'owner';
  permissions: IStaffPermission[];
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  loginAttempts: number;
  isLocked: boolean;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: string;
}
