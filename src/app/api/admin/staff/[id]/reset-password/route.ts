/**
 * API - إعادة تعيين كلمة المرور للموظف (Prisma)
 * Staff Password Reset API (Prisma Ready)
 * 
 * Routes:
 * POST /api/admin/staff/[id]/reset-password - Reset staff password (by Admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateOTP } from '@/lib/security';
import { sendStaffWelcomeEmail } from '@/lib/email-service'; // Recycling the welcome email as it contains temp password info
import {
  requireAdminPermission,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  applyRateLimit,
} from '@/lib/api-utils';

const RATE_LIMIT_ADMIN = { maxRequests: 100, windowMs: 60 * 1000 };

/**
 * POST /api/admin/staff/[id]/reset-password
 * إعادة تعيين كلمة المرور للموظف (بواسطة المدير)
 * Reset staff password (by Admin)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMIT_ADMIN.maxRequests,
      RATE_LIMIT_ADMIN.windowMs
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { auth, authorized } = await requireAdminPermission(request, ['manage_staff', 'admin']);

    if (!auth || !authorized) {
      return createErrorResponse('Insufficient permissions', 403, 'FORBIDDEN');
    }

    // Check if staff exists in Prisma
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) {
      return createErrorResponse('Staff member not found', 404, 'NOT_FOUND');
    }

    // Generate new password
    const tempPassword = generateOTP(12);
    const hashedPassword = await hashPassword(tempPassword);

    // Update staff password and log activity in a transaction
    await prisma.$transaction([
      prisma.staff.update({
        where: { id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }),
      prisma.staffActivity.create({
        data: {
          staffId: auth.userId,
          action: 'reset_staff_password',
          targetId: id,
          targetType: 'staff',
          details: {
            timestamp: new Date(),
            email: existing.email,
          },
        },
      })
    ]);

    // Send password reset email to staff
    try {
      await sendStaffWelcomeEmail(existing.email, existing.fullName || 'Staff Member', tempPassword);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    return createSuccessResponse(
      { staffId: id },
      'Password reset successfully. New temporary password sent to staff email.'
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/staff/[id]/reset-password');
  }
}
