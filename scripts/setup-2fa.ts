/**
 * 2FA SETUP SCRIPT FOR ADMIN ACCOUNTS
 * 
 * This script enables Two-Factor Authentication for admin accounts
 * Run after database migration is complete
 * 
 * Usage:
 * 1. List admins: npx ts-node scripts/setup-2fa.ts --list
 * 2. Setup 2FA: npx ts-node scripts/setup-2fa.ts --email admin@clic7.com
 * 3. Verify: npx ts-node scripts/setup-2fa.ts --verify admin@clic7.com
 * 4. Disable: npx ts-node scripts/setup-2fa.ts --disable admin@clic7.com
 */

import { connectToDatabase } from '../src/lib/database';
import { Staff } from '../src/lib/models';
import * as crypto from 'crypto';

// QRCode is optional - if not installed, will display URI instead
let QRCode: any;
try {
  QRCode = require('qrcode');
} catch (e) {
  console.log('ℹ️  QRCode module not installed. Install with: npm install qrcode\n');
}

/**
 * Generate TOTP secret for 2FA
 * RFC 6238 compliant
 */
function generateTOTPSecret(): string {
  // Generate 20 random bytes (160 bits) for TOTP secret
  const secret = crypto.randomBytes(20);
  // Return base64 encoded
  return secret.toString('base64');
}

/**
 * Generate TOTP URI for QR code
 */
function generateTOTPUri(secret: string, email: string, issuer: string = 'CLIC7'): string {
  const encodedSecret = Buffer.from(secret, 'base64').toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  return `otpauth://totp/${issuer}:${email}?secret=${encodedSecret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate backup codes for account recovery
 */
function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  return codes;
}

/**
 * List all admin accounts
 */
async function listAdmins(): Promise<void> {
  console.log('\n📋 Admin Accounts\n');
  
  await connectToDatabase();
  
  const admins = await Staff.find({
    role: { $in: ['admin', 'supervisor', 'owner'] },
    isActive: true,
    deletedAt: { $exists: false },
  }).select('-password -twoFactorSecret');
  
  if (admins.length === 0) {
    console.log('No admin accounts found.\n');
    return;
  }
  
  console.log('┌────────────────────────────────────────────────────────────┐');
  console.log('│ Email                    │ Role        │ 2FA Status      │');
  console.log('├────────────────────────────────────────────────────────────┤');
  
  for (const admin of admins) {
    const email = admin.email.padEnd(24);
    const role = admin.role.padEnd(11);
    const status = admin.twoFactorEnabled ? '✅ ENABLED' : '❌ DISABLED';
    console.log(`│ ${email} │ ${role} │ ${status.padEnd(15)} │`);
  }
  
  console.log('└────────────────────────────────────────────────────────────┘\n');
  
  const enabled = admins.filter((a: any) => a.twoFactorEnabled).length;
  const total = admins.length;
  
  console.log(`Total: ${total} admins | 2FA Enabled: ${enabled} | 2FA Disabled: ${total - enabled}\n`);
}

/**
 * Setup 2FA for an admin account
 */
async function setup2FA(email: string): Promise<void> {
  console.log(`\n🔐 Setting up 2FA for ${email}\n`);
  
  await connectToDatabase();
  
  // Find admin
  const admin = await Staff.findOne({
    email: email.toLowerCase(),
    isActive: true,
    deletedAt: { $exists: false },
  });
  
  if (!admin) {
    console.error(`❌ Admin not found: ${email}\n`);
    process.exit(1);
  }
  
  if (admin.twoFactorEnabled) {
    console.log(`⚠️  2FA is already enabled for ${email}\n`);
    console.log('To reconfigure, first disable 2FA with: --disable ' + email);
    process.exit(1);
  }
  
  // Generate secret
  const secret = generateTOTPSecret();
  const backupCodes = generateBackupCodes();
  
  // Generate QR code URI
  const uri = generateTOTPUri(secret, admin.email);
  
  // Save to database
  admin.twoFactorSecret = secret;
  admin.twoFactorEnabled = false; // Will be enabled after verification
  await admin.save();
  
  // Generate QR code or display URI
  console.log('✅ 2FA Configuration Generated\n');
  console.log('='.repeat(60));
  console.log('STEP 1: Scan QR Code with Authenticator App');
  console.log('='.repeat(60));
  
  if (QRCode) {
    try {
      const qrCodeAscii = await QRCode.toString(uri, { type: 'terminal', small: true });
      console.log(qrCodeAscii);
    } catch (error) {
      console.log('⚠️  Could not generate QR code. Use manual setup below.');
    }
  } else {
    console.log('ℹ️  QRCode module not available. Install with: npm install qrcode');
  }
  
  console.log('\nManual Setup:');
  console.log(`URI: ${uri}`);
  console.log(`Secret: ${Buffer.from(secret, 'base64').toString('base64').replace(/=/g, '')}\n`);
  
  console.log('='.repeat(60));
  console.log('STEP 2: Save Backup Codes (One-time use only)');
  console.log('='.repeat(60));
  backupCodes.forEach((code, i) => console.log(`  ${i + 1}. ${code}`));
  
  console.log('\n' + '='.repeat(60));
  console.log('STEP 3: Verify Setup');
  console.log('='.repeat(60));
  console.log(`Run: npx ts-node scripts/setup-2fa.ts --verify ${email}`);
  console.log('\n⚠️  IMPORTANT:');
  console.log('   - Store backup codes in a secure location');
  console.log('   - You will need them if you lose access to your phone');
  console.log('   - Each backup code can only be used once');
  console.log('   - 2FA will be enabled after successful verification\n');
}

/**
 * Verify 2FA setup with a code
 */
async function verify2FA(email: string, code?: string): Promise<void> {
  console.log(`\n🔍 Verifying 2FA for ${email}\n`);
  
  await connectToDatabase();
  
  const admin = await Staff.findOne({
    email: email.toLowerCase(),
  }).select('+twoFactorSecret');
  
  if (!admin) {
    console.error(`❌ Admin not found: ${email}\n`);
    process.exit(1);
  }
  
  if (!admin.twoFactorSecret) {
    console.error(`❌ 2FA not configured for ${email}\n`);
    console.log('Run setup first: npx ts-node scripts/setup-2fa.ts --email ' + email);
    process.exit(1);
  }
  
  if (admin.twoFactorEnabled) {
    console.log(`✅ 2FA is already enabled and verified for ${email}\n`);
    return;
  }
  
  // If code provided via command line, verify it
  if (code) {
    const isValid = await verifyTOTP(code, admin.twoFactorSecret);
    
    if (isValid) {
      // Enable 2FA
      admin.twoFactorEnabled = true;
      await admin.save();
      
      console.log('✅ 2FA verification successful!\n');
      console.log(`2FA is now ENABLED for ${email}\n`);
      console.log('This account now requires 2FA codes on every login.\n');
    } else {
      console.error('❌ Invalid 2FA code. Please try again.\n');
      console.log('Make sure your device time is synchronized.');
      process.exit(1);
    }
  } else {
    console.log('To complete verification, run:');
    console.log(`  npx ts-node scripts/setup-2fa.ts --verify ${email} <6-digit-code>\n`);
    console.log('Or verify manually through the admin login page.\n');
  }
}

/**
 * Disable 2FA for an admin account
 */
async function disable2FA(email: string): Promise<void> {
  console.log(`\n🚫 Disabling 2FA for ${email}\n`);
  
  await connectToDatabase();
  
  const admin = await Staff.findOne({
    email: email.toLowerCase(),
  });
  
  if (!admin) {
    console.error(`❌ Admin not found: ${email}\n`);
    process.exit(1);
  }
  
  if (!admin.twoFactorEnabled && !admin.twoFactorSecret) {
    console.log(`ℹ️  2FA is not enabled for ${email}\n`);
    return;
  }
  
  // Clear 2FA settings
  admin.twoFactorEnabled = false;
  admin.twoFactorSecret = undefined;
  await admin.save();
  
  console.log(`✅ 2FA has been disabled for ${email}\n`);
  console.log('⚠️  WARNING: This account no longer requires two-factor authentication.\n');
}

/**
 * Verify TOTP code (same logic as in 2fa/route.ts)
 */
async function verifyTOTP(code: string, secret: string): Promise<boolean> {
  const timeStep = 30;
  const currentTime = Math.floor(Date.now() / 1000);
  
  for (let i = -1; i <= 1; i++) {
    const counter = Math.floor((currentTime + i * timeStep) / timeStep);
    const expectedCode = generateTOTP(secret, counter);
    
    if (code === expectedCode) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate TOTP code
 */
function generateTOTP(secret: string, counter: number): string {
  const decodedSecret = Buffer.from(secret, 'base64');
  
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter), 0);
  
  const hmac = crypto.createHmac('sha1', decodedSecret);
  hmac.update(counterBuffer);
  const hash = hmac.digest();
  
  const offset = hash[hash.length - 1] & 0x0f;
  const code = ((hash[offset] & 0x7f) << 24 |
                (hash[offset + 1] & 0xff) << 16 |
                (hash[offset + 2] & 0xff) << 8 |
                (hash[offset + 3] & 0xff)) % 1000000;
  
  return code.toString().padStart(6, '0');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('\n🔐 2FA Setup for Admin Accounts\n');
    console.log('Usage:');
    console.log('  npx ts-node scripts/setup-2fa.ts --list');
    console.log('  npx ts-node scripts/setup-2fa.ts --email <admin@clic7.com>');
    console.log('  npx ts-node scripts/setup-2fa.ts --verify <admin@clic7.com> [code]');
    console.log('  npx ts-node scripts/setup-2fa.ts --disable <admin@clic7.com>');
    console.log('\nExamples:');
    console.log('  List all admins:     npx ts-node scripts/setup-2fa.ts --list');
    console.log('  Setup 2FA:           npx ts-node scripts/setup-2fa.ts --email admin@clic7.com');
    console.log('  Verify with code:    npx ts-node scripts/setup-2fa.ts --verify admin@clic7.com 123456');
    console.log('  Disable 2FA:         npx ts-node scripts/setup-2fa.ts --disable admin@clic7.com');
    console.log('');
    process.exit(0);
  }
  
  const command = args[0];
  const param = args[1];
  const code = args[2];
  
  try {
    switch (command) {
      case '--list':
        await listAdmins();
        break;
      case '--email':
        if (!param) {
          console.error('Error: Email required. Usage: --email <admin@clic7.com>\n');
          process.exit(1);
        }
        await setup2FA(param);
        break;
      case '--verify':
        if (!param) {
          console.error('Error: Email required. Usage: --verify <admin@clic7.com> [code]\n');
          process.exit(1);
        }
        await verify2FA(param, code);
        break;
      case '--disable':
        if (!param) {
          console.error('Error: Email required. Usage: --disable <admin@clic7.com>\n');
          process.exit(1);
        }
        await disable2FA(param);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run without arguments for help.\n');
        process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
