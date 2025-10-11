import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getUserTransactions } from '@/lib/firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('\n🧪 [TEST API] Fetching transactions for user:', userId);

    const transactions = await getUserTransactions(userId);

    console.log('✅ [TEST API] Success! Found', transactions.length, 'transactions');

    return NextResponse.json({
      success: true,
      count: transactions.length,
      transactions: transactions
    });

  } catch (error: any) {
    console.error('❌ [TEST API] Error:', error);
    
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code,
        details: error.details || 'No additional details'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('🧪 [API TEST] Firestore connection test started');
  
  try {
    // Test 1: Basic write operation
    console.log('📝 [TEST 1] Testing basic write operation...');
    const testRef = adminDb.collection('test').doc('api-connection-test');
    
    await testRef.set({
      timestamp: new Date(),
      message: 'API connection test successful',
      testId: 'api-test-' + Date.now(),
      environment: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      }
    });
    console.log('✅ [TEST 1] Write operation: SUCCESS');

    // Test 2: Read operation
    console.log('📖 [TEST 2] Testing read operation...');
    const doc = await testRef.get();
    
    if (!doc.exists) {
      throw new Error('Document was not found after creation');
    }
    
    const data = doc.data();
    console.log('✅ [TEST 2] Read operation: SUCCESS');
    console.log('📄 [DATA] Retrieved:', data?.message);

    // Test 3: Test app collections
    console.log('🗂️ [TEST 3] Testing app collections...');
    
    // Test documents collection
    const docRef = adminDb.collection('documents').doc('api-test-doc');
    await docRef.set({
      id: 'api-test-doc',
      userId: 'api-test-user',
      name: 'test-document.pdf',
      uploadDate: new Date().toISOString(),
      type: 'receipt',
      status: 'pending',
      storageUrl: 'placeholder://test/document.pdf',
      extractedTransactionCount: 0,
      createdAt: new Date()
    });
    console.log('✅ [TEST 3] Documents collection: SUCCESS');

    // Test transactions collection
    const txRef = adminDb.collection('transactions').doc('api-test-tx');
    await txRef.set({
      id: 'api-test-tx',
      userId: 'api-test-user',
      date: '2025-10-04',
      merchant: 'API Test Store',
      amount: -15.99,
      type: 'expense',
      category: 'Testing',
      status: 'cleared',
      sourceDocumentId: 'api-test-doc',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ [TEST 3] Transactions collection: SUCCESS');

    // Test 4: Query operations
    console.log('🔍 [TEST 4] Testing query operations...');
    
    const docsQuery = await adminDb
      .collection('documents')
      .where('userId', '==', 'api-test-user')
      .limit(1)
      .get();
    
    console.log('✅ [TEST 4] Documents query: SUCCESS');
    console.log('📊 [QUERY] Found', docsQuery.size, 'document(s)');

    // Test 5: Cleanup
    console.log('🧹 [TEST 5] Cleaning up test data...');
    await testRef.delete();
    await docRef.delete();
    await txRef.delete();
    console.log('✅ [TEST 5] Cleanup: SUCCESS');

    // Success response
    console.log('🎉 [COMPLETE] All Firestore tests passed!');
    
    return NextResponse.json({
      success: true,
      message: 'Firestore is working correctly!',
      tests: {
        basicWrite: '✅ SUCCESS',
        basicRead: '✅ SUCCESS',
        documentsCollection: '✅ SUCCESS',
        transactionsCollection: '✅ SUCCESS',
        queryOperations: '✅ SUCCESS',
        cleanup: '✅ SUCCESS'
      },
      environment: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        hasCredentials: !!(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [ERROR] Firestore test failed:', error);
    
    // Detailed error analysis
    let errorAnalysis = 'Unknown error';
    let solution = 'Check server logs for details';
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        errorAnalysis = 'Permission denied - Security rules are too restrictive';
        solution = 'Go to Firebase Console > Firestore > Rules and set: allow read, write: if true;';
      } else if (errorMessage.includes('not found') || errorMessage.includes('project')) {
        errorAnalysis = 'Project not found - Check project ID or Firestore not enabled';
        solution = 'Verify FIREBASE_PROJECT_ID in .env.local and enable Firestore in Firebase Console';
      } else if (errorMessage.includes('credential') || errorMessage.includes('auth')) {
        errorAnalysis = 'Authentication failed - Check service account credentials';
        solution = 'Verify FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local';
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        errorAnalysis = 'Network error - Check internet connection';
        solution = 'Check your internet connection and Firebase service status';
      }
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorAnalysis,
      solution,
      environment: {
        projectId: process.env.FIREBASE_PROJECT_ID || 'NOT SET',
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}