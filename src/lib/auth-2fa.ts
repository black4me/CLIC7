/**
 * 2FA Logic Library
 * Shared logic for 2FA generation and verification
 */

import { generateOTP } from '@/lib/security';
import crypto from 'crypto';

// Temporary storage for pending 2FA sessions (use Redis in production)
// Exported for use in verification
export const pending2FASessions = new Map<string, {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
    fullName: string;
    expiresAt: number;
}>();

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Create a pending 2FA session
 * Called from login route when 2FA is required
 */
export async function createPending2FASession(
    userId: string,
    email: string,
    role: string,
    permissions: string[],
    fullName: string
): Promise<string> {
    const sessionToken = generateOTP(32); // Generate random session token

    pending2FASessions.set(sessionToken, {
        userId,
        email,
        role,
        permissions,
        fullName,
        expiresAt: Date.now() + SESSION_TIMEOUT,
    });

    // Cleanup expired sessions periodically
    if (Math.random() < 0.1) {
        cleanupExpiredSessions();
    }

    return sessionToken;
}

/**
 * Cleanup expired 2FA sessions
 */
function cleanupExpiredSessions(): void {
    const now = Date.now();
    const entries = Array.from(pending2FASessions.entries());
    for (const [token, session] of entries) {
        if (now > session.expiresAt) {
            pending2FASessions.delete(token);
        }
    }
}

/**
 * Verify TOTP code against secret
 */
export async function verifyTOTP(code: string, secret: string | undefined): Promise<boolean> {
    if (!secret) return false;

    try {
        // Current time window (30 seconds)
        const timeStep = 30;
        const currentTime = Math.floor(Date.now() / 1000);

        // Check current and adjacent time windows (allows for clock drift)
        for (let i = -1; i <= 1; i++) {
            const counter = Math.floor((currentTime + i * timeStep) / timeStep);
            const expectedCode = generateTOTP(secret, counter);

            if (code === expectedCode) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('TOTP verification error:', error);
        return false;
    }
}

/**
 * Decode Base32 string to Buffer (RFC 4648)
 */
function base32Decode(base32: string): Buffer {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const chars = base32.toUpperCase().replace(/=+$/, '');

    let bits = '';
    for (let i = 0; i < chars.length; i++) {
        const val = base32Chars.indexOf(chars[i]);
        if (val === -1) continue; // Skip invalid characters
        bits += val.toString(2).padStart(5, '0');
    }

    // Convert bits to bytes
    const bytes = [];
    for (let i = 0; i < bits.length - 7; i += 8) {
        bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }

    return Buffer.from(bytes);
}

/**
 * Generate TOTP code (RFC 6238 compatible with Google Authenticator)
 */
function generateTOTP(secret: string, counter: number): string {
    // Decode base32 secret (Google Authenticator format)
    const decodedSecret = base32Decode(secret);

    // Create buffer from counter
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter), 0);

    // Generate HMAC
    const hmac = crypto.createHmac('sha1', decodedSecret);
    hmac.update(counterBuffer);
    const hash = hmac.digest();

    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0x0f;
    const code = ((hash[offset] & 0x7f) << 24 |
        (hash[offset + 1] & 0xff) << 16 |
        (hash[offset + 2] & 0xff) << 8 |
        (hash[offset + 3] & 0xff)) % 1000000;

    // Pad with leading zeros
    return code.toString().padStart(6, '0');
}
