/**
 * DATABASE MIGRATION SCRIPT - Game Key Encryption
 * 
 * CRITICAL: Run this script AFTER backing up your database
 * This script migrates plain-text game keys to AES-256 encrypted format
 * 
 * Usage:
 * 1. Backup database: mongodump --uri="mongodb://..." --out=./backup-$(date +%Y%m%d)
 * 2. Set ENCRYPTION_KEY in .env (64 hex characters)
 * 3. Run: npx ts-node scripts/migrate-gamekeys.ts --dry-run (to preview)
 * 4. Run: npx ts-node scripts/migrate-gamekeys.ts (to execute)
 * 5. Verify migration completed successfully
 * 6. Run cleanup: npx ts-node scripts/migrate-gamekeys.ts --cleanup
 */

import { connectToDatabase } from '../src/lib/database';
import { GameKey } from '../src/lib/models';
import { encrypt, decrypt } from '../src/lib/security';

interface MigrationStats {
  total: number;
  migrated: number;
  alreadyEncrypted: number;
  failed: number;
  errors: string[];
}

async function runMigration(dryRun: boolean = false): Promise<MigrationStats> {
  const stats: MigrationStats = {
    total: 0,
    migrated: 0,
    alreadyEncrypted: 0,
    failed: 0,
    errors: [],
  };

  try {
    console.log(`\n🔐 Game Key Migration ${dryRun ? '(DRY RUN)' : '(EXECUTION)'}\n`);
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connected\n');

    // Test encryption key is valid
    try {
      const testEncrypted = encrypt('test-key-123');
      const testDecrypted = decrypt(testEncrypted);
      if (testDecrypted !== 'test-key-123') {
        throw new Error('Encryption/decryption test failed');
      }
      console.log('✅ Encryption key validated\n');
    } catch (error) {
      console.error('❌ ENCRYPTION KEY ERROR:', error);
      console.error('\nEnsure ENCRYPTION_KEY is set in .env (64 hex characters)');
      console.error('Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
      process.exit(1);
    }

    // Find all GameKey documents with plain-text 'key' field
    const keysToMigrate = await GameKey.find({
      $or: [
        { key: { $exists: true } },
        { encryptedKey: { $exists: false } },
      ],
    });

    stats.total = keysToMigrate.length;
    console.log(`📊 Found ${stats.total} game keys to process\n`);

    if (stats.total === 0) {
      console.log('✅ No migration needed - all keys are already encrypted\n');
      return stats;
    }

    // Process each key
    for (let i = 0; i < keysToMigrate.length; i++) {
      const keyDoc = keysToMigrate[i];
      const progress = `[${i + 1}/${stats.total}]`;

      try {
        // Check if already has encryptedKey and it's valid
        if (keyDoc.encryptedKey && keyDoc.encryptedKey.includes(':')) {
          // Verify it's actually encrypted by trying to decrypt
          try {
            await keyDoc.decryptKey();
            console.log(`${progress} ⏭️  Already encrypted: ${keyDoc.gameName} (${keyDoc._id})`);
            stats.alreadyEncrypted++;
            continue;
          } catch (e) {
            // Invalid encryption, will re-encrypt
          }
        }

        // Check for legacy 'key' field
        const legacyKey = (keyDoc as any).key;
        
        if (!legacyKey) {
          console.log(`${progress} ⚠️  No plain-text key found: ${keyDoc.gameName} (${keyDoc._id})`);
          stats.errors.push(`No key to encrypt for ${keyDoc._id}`);
          stats.failed++;
          continue;
        }

        // Encrypt the plain-text key
        const encryptedValue = encrypt(legacyKey);

        if (dryRun) {
          console.log(`${progress} 🔍 Would encrypt: ${keyDoc.gameName}`);
          console.log(`    Plain:    ${legacyKey.substring(0, 20)}...`);
          console.log(`    Encrypted: ${encryptedValue.substring(0, 40)}...\n`);
          stats.migrated++;
        } else {
          // Update document
          keyDoc.encryptedKey = encryptedValue;
          await keyDoc.save();
          
          // Verify encryption worked
          const verifyDecrypted = await keyDoc.decryptKey();
          if (verifyDecrypted !== legacyKey) {
            throw new Error('Encryption verification failed');
          }

          console.log(`${progress} ✅ Migrated: ${keyDoc.gameName} (${keyDoc._id})`);
          stats.migrated++;
        }

      } catch (error) {
        const errorMsg = `Failed to migrate ${keyDoc._id}: ${error}`;
        console.error(`${progress} ❌ ${errorMsg}`);
        stats.errors.push(errorMsg);
        stats.failed++;
      }
    }

    return stats;

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

async function runCleanup(dryRun: boolean = false): Promise<void> {
  console.log(`\n🧹 Cleanup Legacy Fields ${dryRun ? '(DRY RUN)' : '(EXECUTION)'}\n`);
  
  await connectToDatabase();
  
  // Find documents that still have the legacy 'key' field
  const keysWithLegacyField = await GameKey.find({ key: { $exists: true } });
  
  console.log(`Found ${keysWithLegacyField.length} documents with legacy 'key' field\n`);
  
  if (keysWithLegacyField.length === 0) {
    console.log('✅ No cleanup needed - no legacy fields found\n');
    return;
  }

  for (const keyDoc of keysWithLegacyField) {
    if (dryRun) {
      console.log(`🔍 Would remove 'key' field from: ${keyDoc.gameName} (${keyDoc._id})`);
    } else {
      // Remove the legacy field
      await GameKey.updateOne(
        { _id: keyDoc._id },
        { $unset: { key: 1 } }
      );
      console.log(`✅ Removed legacy 'key' field from: ${keyDoc.gameName} (${keyDoc._id})`);
    }
  }
  
  console.log(`\n${dryRun ? 'Would cleanup' : 'Cleaned up'} ${keysWithLegacyField.length} documents\n`);
}

async function verifyMigration(): Promise<void> {
  console.log('\n🔍 Verification Report\n');
  
  await connectToDatabase();
  
  const totalKeys = await GameKey.countDocuments();
  const encryptedKeys = await GameKey.countDocuments({
    encryptedKey: { $exists: true, $regex: /^[a-f0-9]+:[a-f0-9]+$/ },
  });
  const legacyKeys = await GameKey.countDocuments({ key: { $exists: true } });
  const keysWithoutEncryption = await GameKey.countDocuments({
    $or: [
      { encryptedKey: { $exists: false } },
      { encryptedKey: null },
    ],
  });

  console.log('Database State:');
  console.log(`  Total GameKey documents:     ${totalKeys}`);
  console.log(`  With encryptedKey:           ${encryptedKeys}`);
  console.log(`  With legacy 'key' field:     ${legacyKeys}`);
  console.log(`  Without encryption:          ${keysWithoutEncryption}`);
  
  if (legacyKeys === 0 && keysWithoutEncryption === 0 && encryptedKeys === totalKeys) {
    console.log('\n✅ ALL KEYS SUCCESSFULLY ENCRYPTED\n');
  } else {
    console.log('\n⚠️  MIGRATION INCOMPLETE - Review required\n');
    
    if (legacyKeys > 0) {
      console.log(`Run cleanup: npx ts-node scripts/migrate-gamekeys.ts --cleanup`);
    }
    
    if (keysWithoutEncryption > 0) {
      console.log(`Run migration: npx ts-node scripts/migrate-gamekeys.ts`);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const cleanup = args.includes('--cleanup');
  const verify = args.includes('--verify');

  try {
    if (verify) {
      await verifyMigration();
    } else if (cleanup) {
      await runCleanup(dryRun);
      if (!dryRun) {
        await verifyMigration();
      }
    } else {
      const stats = await runMigration(dryRun);
      
      console.log('\n' + '='.repeat(60));
      console.log('MIGRATION SUMMARY');
      console.log('='.repeat(60));
      console.log(`Total processed:      ${stats.total}`);
      console.log(`Successfully migrated: ${stats.migrated}`);
      console.log(`Already encrypted:    ${stats.alreadyEncrypted}`);
      console.log(`Failed:               ${stats.failed}`);
      
      if (stats.errors.length > 0) {
        console.log('\nErrors:');
        stats.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
      }
      
      if (!dryRun && stats.migrated > 0 && stats.failed === 0) {
        console.log('\n✅ Migration completed successfully!');
        console.log('Run verification: npx ts-node scripts/migrate-gamekeys.ts --verify');
        console.log('Run cleanup: npx ts-node scripts/migrate-gamekeys.ts --cleanup');
      } else if (dryRun) {
        console.log('\n🔍 Dry run completed. No changes made.');
        console.log('To execute: npx ts-node scripts/migrate-gamekeys.ts');
      }
      
      console.log('');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
