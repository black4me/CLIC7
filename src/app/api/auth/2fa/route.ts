/**
 * API - 2FA Verification
 * Two-Factor Authentication verification for admin accounts
 * 
 * Routes:
 * POST /api/auth/2fa/verify - Verify 2FA token and complete login
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { generateJWT } from '@/lib/security';
import { pending2FASessions, verifyTOTP } from '@/lib/auth-2fa';

/**
 * POST /api/auth/2fa/verify
 * Verify 2FA token and complete login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, otpCode } = body;

    if (!sessionToken || !otpCode) {
      return NextResponse.json(
        { success: false, message: 'Session token and OTP code are required' },
        { status: 400 }
      );
    }

    // Check if session exists and is not expired
    const session = pending2FASessions.get(sessionToken);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired session. Please login again.' },
        { status: 401 }
      );
    }

    if (Date.now() > session.expiresAt) {
      pending2FASessions.delete(sessionToken);
      return NextResponse.json(
        { success: false, message: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }

    // Get user to verify 2FA secret
    const user = await prisma.staff.findUnique({
      where: { id: session.userId },
      include: { permissions: true }
    });

    if (!user) {
      pending2FASessions.delete(sessionToken);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify OTP code
    const isValid = await verifyTOTP(otpCode, user.twoFactorSecret || undefined);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid 2FA code. Please try again.' },
        { status: 401 }
      );
    }

    // Clear pending session
    pending2FASessions.delete(sessionToken);

    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions.map((p: { permission: string }) => p.permission),
      twoFactorVerified: true,
    }, '24h');

    const cookieStore = await cookies();

    // Set secure authentication cookie with JWT
    cookieStore.set('clic7_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    // Set additional session info cookie (non-httpOnly for client-side access)
    cookieStore.set('clic7_admin_session', JSON.stringify({
      email: user.email,
      role: user.role,
      name: user.fullName || 'Admin User',
      twoFactorVerified: true,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    // Log successful 2FA verification
    console.log(`[SECURITY] 2FA verified for admin: ${user.email} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.fullName || 'Admin User',
        permissions: user.permissions.map((p: { permission: string }) => p.permission)
      }
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
