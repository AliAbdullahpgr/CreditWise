import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getUserTransactions } from '@/lib/firebase/firestore';

export async function GET(request: NextRequest) {
  const results: any[] = [];
  const userId = 'wvc3k1IU1XOahpRCUODip22ApVv2'; // Your user ID

  console.log('\n' + '='.repeat(60));
  console.log('🧪 AUTOMATED FIRESTORE TEST STARTING');
  console.log('='.repeat(60));

  try {
    // Test 1: Check documents collection
    console.log('\n📄 [TEST 1] Checking documents collection...');
    const docsSnapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('documents')
      .get();

    const documentsCount = docsSnapshot.size;
    console.log(`✅ [TEST 1] Found ${documentsCount} documents`);
    
    results.push({
      test: 'Documents Collection',
      status: documentsCount > 0 ? 'PASS' : 'FAIL',
      count: documentsCount,
      documents: docsSnapshot.docs.slice(0, 3).map(doc => ({
        id: doc.id,
        name: doc.data().name,
        status: doc.data().status,
        uploadDate: doc.data().uploadDate
      }))
    });

    if (documentsCount > 0) {
      console.log('📋 First 3 documents:');
      docsSnapshot.docs.slice(0, 3).forEach((doc, i) => {
        const data = doc.data();
        console.log(`   ${i + 1}. ${data.name} - Status: ${data.status} - Date: ${data.uploadDate}`);
      });
    }

    // Test 2: Check transactions collection (WITHOUT orderBy)
    console.log('\n💳 [TEST 2] Checking transactions collection (no orderBy)...');
    const txSnapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('transactions')
      .get();

    const transactionsCount = txSnapshot.size;
    console.log(`✅ [TEST 2] Found ${transactionsCount} transactions`);

    const transactions = txSnapshot.docs.map(doc => doc.data());
    
    results.push({
      test: 'Transactions Collection (Direct)',
      status: transactionsCount > 0 ? 'PASS' : 'FAIL',
      count: transactionsCount,
      transactions: transactions.slice(0, 5).map(tx => ({
        merchant: tx.merchant,
        amount: tx.amount,
        date: tx.date,
        category: tx.category
      }))
    });

    if (transactionsCount > 0) {
      console.log('💰 First 5 transactions:');
      transactions.slice(0, 5).forEach((tx, i) => {
        console.log(`   ${i + 1}. ${tx.merchant} - $${tx.amount} - ${tx.date} - ${tx.category}`);
      });

      // Calculate total
      const total = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      console.log(`💵 Total amount: $${total.toFixed(2)}`);
    }

    // Test 3: Test getUserTransactions function (with memory sorting)
    console.log('\n🔧 [TEST 3] Testing getUserTransactions() function...');
    const fetchedTransactions = await getUserTransactions(userId);
    
    console.log(`✅ [TEST 3] getUserTransactions returned ${fetchedTransactions.length} transactions`);
    
    results.push({
      test: 'getUserTransactions Function',
      status: fetchedTransactions.length > 0 ? 'PASS' : 'FAIL',
      count: fetchedTransactions.length,
      sorted: true,
      transactions: fetchedTransactions.slice(0, 5).map(tx => ({
        merchant: tx.merchant,
        amount: tx.amount,
        date: tx.date
      }))
    });

    if (fetchedTransactions.length > 0) {
      console.log('📊 First 5 (sorted by date):');
      fetchedTransactions.slice(0, 5).forEach((tx, i) => {
        console.log(`   ${i + 1}. ${tx.merchant} - $${tx.amount} - ${tx.date}`);
      });
    }

    // Test 4: Verify sorting
    console.log('\n🔍 [TEST 4] Verifying date sorting...');
    if (fetchedTransactions.length > 1) {
      let isSorted = true;
      for (let i = 0; i < fetchedTransactions.length - 1; i++) {
        const date1 = new Date(fetchedTransactions[i].date).getTime();
        const date2 = new Date(fetchedTransactions[i + 1].date).getTime();
        if (date1 < date2) {
          isSorted = false;
          break;
        }
      }
      console.log(`${isSorted ? '✅' : '❌'} [TEST 4] Transactions are ${isSorted ? 'properly' : 'NOT'} sorted (newest first)`);
      results.push({
        test: 'Date Sorting',
        status: isSorted ? 'PASS' : 'FAIL',
        sorted: isSorted
      });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    const passedTests = results.filter(r => r.status === 'PASS').length;
    const totalTests = results.length;
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    console.log('='.repeat(60) + '\n');

    return NextResponse.json({
      success: true,
      summary: {
        totalTests: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests
      },
      results: results
    });

  } catch (error: any) {
    console.error('\n❌ ERROR DURING TESTING:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);

    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        code: error.code,
        results: results
      },
      { status: 500 }
    );
  }
}
