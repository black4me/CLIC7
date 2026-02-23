/**
 * Admin User Seeder Script
 * Creates or updates the default admin user
 * 
 * Usage:
 * npx ts-node scripts/seed-admin.ts
 */

import { connectToDatabase } from '../src/lib/database';
import { Staff } from '../src/lib/models';

async function seedAdmin() {
  try {
    console.log('🔌 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connected\n');

    // Default admin credentials
    const adminEmail = 'clickstore.om@gmail.com';
    const adminPassword = '93545740qQ';
    const adminName = 'CLIC7 Store Administrator';

    console.log('👤 Creating admin user...');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name: ${adminName}\n`);

    // Check if admin already exists
    const existingAdmin = await Staff.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Status: ${existingAdmin.isActive ? 'Active' : 'Inactive'}\n`);
      console.log('✅ No changes made. You can login with existing credentials.\n');
      process.exit(0);
    }

    // Create new admin user
    // Password will be automatically hashed by the pre-save middleware
    const admin = new Staff({
      email: adminEmail,
      fullName: adminName,
      password: adminPassword, // Will be hashed automatically
      role: 'admin',
      permissions: [
        { permission: 'manage_products', canPerform: true },
        { permission: 'manage_orders', canPerform: true },
        { permission: 'manage_staff', canPerform: true },
        { permission: 'manage_settings', canPerform: true },
        { permission: 'verify_payments', canPerform: true },
        { permission: 'view_logs', canPerform: true },
        { permission: 'manage_categories', canPerform: true },
        { permission: 'manage_coupons', canPerform: true },
      ],
      isActive: true,
      twoFactorEnabled: false, // Can be enabled later via 2FA setup
    });

    await admin.save();

    console.log('✅ Admin user created successfully!\n');
    console.log('='.repeat(60));
    console.log('LOGIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('='.repeat(60));
    console.log('\n📝 Important Notes:');
    console.log('   1. Change this password after first login');
    console.log('   2. Enable 2FA for better security');
    console.log('   3. This is a test account - create production users separately\n');
    
    console.log('🚀 You can now login at: http://localhost:3002/admin/login\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
