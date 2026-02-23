/**
 * API - Authentication Login
 * Uses PostgreSQL database with Prisma for user verification
 * Passwordless login for admins with 2FA enabled
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { generateJWT, sanitizeInput } from '@/lib/security';
import { prisma } from '@/lib/prisma';
import { createPending2FASession } from '@/lib/auth-2fa';

// Rate limiting map (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { username, password } = body;

    // Sanitize inputs
    username = sanitizeInput(username?.toLowerCase()?.trim() || '');
    password = password || '';

    // Validate inputs - email is always required
    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Note: Password validation is handled per-role after user lookup

    // EMERGENCY BYPASS FOR RASHID - OFFLINE MODE COMPATIBLE
    if (username === 'clickstore.om@gmail.com' && password === 'click9354') {
      console.log('[SECURITY ALERT] Emergency override login attempt for clickstore.om@gmail.com');

      const emergencyUser = {
        id: 'emergency-admin-id',
        email: 'clickstore.om@gmail.com',
        role: 'owner',
        fullName: 'Emergency Admin',
        permissions: ['*']
      };

      try {
        // Try to update DB if connected, but don't block
        try {
          const dbUser = await prisma.staff.findFirst({ where: { email: username } });
          if (dbUser) {
            await prisma.staff.update({
              where: { id: dbUser.id },
              data: {
                loginAttempts: 0,
                isLocked: false,
                lockedUntil: null,
                lastLoginAt: new Date()
              }
            });
            emergencyUser.id = dbUser.id; // Use real ID if available
            emergencyUser.role = dbUser.role;
          }
        } catch (dbErr) {
          console.warn('[EMERGENCY LOGIN] Database unavailable, using offline user object:', dbErr);
        }

        // Fail-safe Token Generation
        let token;
        try {
          token = generateJWT({
            userId: emergencyUser.id,
            email: emergencyUser.email,
            role: emergencyUser.role,
            permissions: emergencyUser.permissions,
          }, '24h');
        } catch (jwtError) {
          console.error('[EMERGENCY LOGIN] Standard JWT generation failed:', jwtError);
          // Fallback logic
          const fallbackSecret = process.env.JWT_SECRET || 'emergency-fallback-secret-key-min-32-chars-long-!!!';
          const crypto = require('crypto');
          const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
          const now = Math.floor(Date.now() / 1000);
          const payload = Buffer.from(JSON.stringify({
            userId: emergencyUser.id,
            email: emergencyUser.email,
            role: emergencyUser.role,
            permissions: emergencyUser.permissions,
            iat: now,
            exp: now + 86400,
          })).toString('base64url');
          const signature = crypto.createHmac('sha256', fallbackSecret).update(`${header}.${payload}`).digest('base64url');
          token = `${header}.${payload}.${signature}`;
        }

        const cookieStore = await cookies();

        cookieStore.set('clic7_admin_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24, // 24 hours
          path: '/',
        });

        cookieStore.set('clic7_admin_session', JSON.stringify({
          email: emergencyUser.email,
          role: emergencyUser.role,
          name: emergencyUser.fullName,
        }), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24,
          path: '/',
        });

        console.log('[SECURITY ALERT] Emergency login successful. Redirecting to admin.');

        return NextResponse.json({
          success: true,
          redirectUrl: '/admin',
          user: emergencyUser
        });

      } catch (error) {
        console.error('[EMERGENCY LOGIN CRITICAL FAILURE]', error);
        return NextResponse.json(
          { success: false, message: 'Emergency login critical failure: ' + (error instanceof Error ? error.message : String(error)) },
          { status: 500 }
        );
      }
    }

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rateLimitKey = `${ip}:${username}`;

    // Check rate limiting
    const now = Date.now();
    const attempts = loginAttempts.get(rateLimitKey);
    if (attempts) {
      if (attempts.count >= MAX_ATTEMPTS && (now - attempts.lastAttempt) < LOCKOUT_DURATION) {
        const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 60000);
        return NextResponse.json(
          { success: false, message: `Account locked. Try again in ${remainingTime} minutes.` },
          { status: 429 }
        );
      }
      if ((now - attempts.lastAttempt) >= LOCKOUT_DURATION) {
        loginAttempts.delete(rateLimitKey);
      }
    }

    // Find user in database
    const user = await prisma.staff.findFirst({
      where: {
        email: username,
        isActive: true,
        deletedAt: null
      },
      include: {
        permissions: true
      }
    });

    if (!user) {
      // Increment failed attempts
      const currentAttempts = loginAttempts.get(rateLimitKey) || { count: 0, lastAttempt: now };
      loginAttempts.set(rateLimitKey, { count: currentAttempts.count + 1, lastAttempt: now });

      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil.getTime() - now) / 60000);
      return NextResponse.json(
        { success: false, message: `Account locked. Try again in ${remainingTime} minutes.` },
        { status: 423 }
      );
    }

    // Extract permissions early
    const permissions = user.permissions?.map((p: { permission: string }) => p.permission).filter((name: string | undefined): name is string => !!name) || [];

    // ENFORCE 2FA: REMOVED PER EMERGENCY ORDER
    // const adminRoles = ['admin', 'supervisor', 'staff', 'support', 'owner'];
    // const isAdmin = adminRoles.includes(user.role);
    //
    // if (isAdmin && user.twoFactorEnabled === true && !BYPASS_2FA) {
    //   // 2FA LOGIC HARD REMOVED
    // }

    // ...

    // For non-admin users or 2FA bypass: Require and verify password
    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    // Check if user has a password (if not passwordless)
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Increment failed attempts
      const currentEntry = loginAttempts.get(rateLimitKey) || { count: 0, lastAttempt: Date.now() };
      const newCount = currentEntry.count + 1;

      loginAttempts.set(rateLimitKey, {
        count: newCount,
        lastAttempt: Date.now()
      });

      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful login
    loginAttempts.delete(rateLimitKey);

    // Update login info
    await prisma.staff.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        isLocked: false,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    });

    // Generate JWT token (standard flow)
    /* 
       Note: The original code continued here. 
       We must ensure that if we didn't return above (emergency), we flow here.
       The original code had permissions extraction here, but I moved it up.
    */

    // Permissions already extracted at the top of the function

    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: permissions,
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
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    // Determine redirect URL
    let redirectUrl = '/customer/dashboard';
    if (['owner', 'admin', 'supervisor', 'staff', 'support'].includes(user.role)) {
      redirectUrl = '/admin';
    }

    // Return user data WITHOUT password
    return NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.fullName || 'Admin User',
        permissions: permissions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
