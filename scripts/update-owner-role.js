const { Client } = require('pg');

async function updateRashidRole() {
    console.log('🚀 EXECUTIVE ORDER: Updating Rashid\'s Role to OWNER\n');
    
    const client = new Client({
        host: 'db.tcwtqkklmhlucoirnogq.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'Click9354@2026',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
    });
    
    try {
        console.log('⏳ Connecting to database (timeout: 10s)...');
        await client.connect();
        console.log('✅ Connected to database\n');
        
        // First, check if the user exists and current role
        console.log('🔍 Checking current staff record...');
        const checkResult = await client.query(
            'SELECT id, email, role, "fullName", "isActive" FROM public.staff WHERE email = $1',
            ['clickstore.om@gmail.com']
        );
        
        if (checkResult.rows.length === 0) {
            console.log('❌ User not found. Creating owner account...\n');
            
            // Insert new owner record
            const insertResult = await client.query(
                `INSERT INTO public.staff (
                    id, email, "fullName", password, role, "isActive", 
                    "twoFactorEnabled", "loginAttempts", "isLocked", 
                    "createdAt", "updatedAt"
                ) VALUES (
                    gen_random_uuid(),
                    $1,
                    'CLIC7 Store Owner',
                    null,
                    'owner',
                    true,
                    true,
                    0,
                    false,
                    NOW(),
                    NOW()
                ) RETURNING id, email, role, "fullName"`,
                ['clickstore.om@gmail.com']
            );
            
            console.log('✅ Owner account created successfully!');
            console.log('📧 Email:', insertResult.rows[0].email);
            console.log('🎭 Role:', insertResult.rows[0].role);
            console.log('👤 Name:', insertResult.rows[0].fullName);
        } else {
            const user = checkResult.rows[0];
            console.log('📊 Current Status:');
            console.log('   Email:', user.email);
            console.log('   Current Role:', user.role);
            console.log('   Active:', user.isActive);
            console.log('   Name:', user.fullName);
            
            if (user.role === 'owner') {
                console.log('\n✅ Role is already OWNER - No update needed!');
            } else {
                console.log('\n📝 Updating role from', user.role, 'to OWNER...\n');
                
                const updateResult = await client.query(
                    'UPDATE public.staff SET role = $1, "updatedAt" = NOW() WHERE email = $2 RETURNING id, email, role',
                    ['owner', 'clickstore.om@gmail.com']
                );
                
                console.log('✅ Role updated successfully!');
                console.log('📧 Email:', updateResult.rows[0].email);
                console.log('🎭 New Role:', updateResult.rows[0].role);
            }
        }
        
        // Verify final state
        console.log('\n🔍 Verification - All staff records:');
        const allStaff = await client.query(
            'SELECT email, role, "isActive" FROM public.staff ORDER BY "createdAt" DESC LIMIT 5'
        );
        
        allStaff.rows.forEach((row, i) => {
            const icon = row.email === 'clickstore.om@gmail.com' ? '👑' : '👤';
            console.log(`   ${icon} ${row.email} [${row.role}] ${row.isActive ? '✅' : '❌'}`);
        });
        
        await client.end();
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ EXECUTIVE ORDER COMPLETED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log('\n🎉 Rashid can now login as OWNER');
        console.log('   Access: http://localhost:3000/admin/login');
        console.log('   Email: clickstore.om@gmail.com');
        console.log('   Auth: 2FA/OTP (passwordless)');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.message.includes('password authentication failed')) {
            console.error('   ⚠️  Database password issue');
        } else if (error.message.includes('ENOTFOUND')) {
            console.error('   ⚠️  Database host unreachable');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.error('   ⚠️  Connection refused - check if database is active');
        } else if (error.message.includes('ETIMEDOUT')) {
            console.error('   ⚠️  Connection timeout - network issue or database paused');
            console.error('   💡 Try: npx prisma db push --force when connection is stable');
        } else if (error.message.includes('relation "staff" does not exist')) {
            console.error('   ⚠️  Staff table does not exist - run: npx prisma db push');
        }
        
        try {
            await client.end();
        } catch (e) {}
        
        return false;
    }
}

updateRashidRole().then(success => {
    process.exit(success ? 0 : 1);
});