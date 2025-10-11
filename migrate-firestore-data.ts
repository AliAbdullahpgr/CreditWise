/**
 * Data Migration Script: Root-level to User-scoped Collections
 * 
 * This script migrates data from root-level collections to user-scoped collections.
 * 
 * OLD STRUCTURE:
 * /creditReports/{reportId}
 * /documents/{docId}
 * /transactions/{txId}
 * 
 * NEW STRUCTURE:
 * /users/{userId}/creditReports/{reportId}
 * /users/{userId}/documents/{docId}
 * /users/{userId}/transactions/{txId}
 */

import { adminDb } from './src/lib/firebase/admin';

async function migrateData() {
  console.log('🚀 Starting data migration...\n');

  try {
    // Get all collections to migrate
    const collections = ['creditReports', 'documents', 'transactions'];
    
    for (const collectionName of collections) {
      console.log(`\n📦 Migrating ${collectionName}...`);
      
      // Get all documents from root-level collection
      const snapshot = await adminDb.collection(collectionName).get();
      
      if (snapshot.empty) {
        console.log(`   ⚠️  No documents found in ${collectionName}`);
        continue;
      }
      
      console.log(`   Found ${snapshot.size} documents`);
      
      let migratedCount = 0;
      let errorCount = 0;
      
      // Migrate each document
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const userId = data.userId;
        
        if (!userId) {
          console.log(`   ⚠️  Document ${doc.id} has no userId, skipping`);
          errorCount++;
          continue;
        }
        
        try {
          // Copy to new location
          await adminDb
            .collection('users')
            .doc(userId)
            .collection(collectionName)
            .doc(doc.id)
            .set(data);
          
          migratedCount++;
          console.log(`   ✅ Migrated ${doc.id} to users/${userId}/${collectionName}`);
        } catch (error) {
          console.error(`   ❌ Error migrating ${doc.id}:`, error);
          errorCount++;
        }
      }
      
      console.log(`\n   📊 ${collectionName} Summary:`);
      console.log(`      - Migrated: ${migratedCount}`);
      console.log(`      - Errors: ${errorCount}`);
      console.log(`      - Total: ${snapshot.size}`);
    }
    
    console.log('\n\n✅ Migration complete!');
    console.log('\n⚠️  IMPORTANT: Old data still exists at root level.');
    console.log('After verifying the migration, manually delete old collections from Firebase Console.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
