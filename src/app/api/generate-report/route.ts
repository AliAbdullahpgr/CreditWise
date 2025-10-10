import { NextRequest, NextResponse } from 'next/server';
import { getUserTransactions } from '@/lib/firebase/firestore';
import { analyzeTransactionsForCreditScore } from '@/lib/credit-analysis';
import { calculateCreditScore } from '@/ai/flows/calculate-credit-score';

export async function POST(request: NextRequest) {
  console.log('\n🎯 [API] /api/generate-report called');
  
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      console.log('❌ [API] Missing userId');
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('👤 [API] User ID:', userId);

    // Step 1: Fetch user transactions
    console.log('\n📥 [STEP 1] Fetching transactions from Firestore...');
    const transactions = await getUserTransactions(userId);
    console.log('✅ [STEP 1] Fetched', transactions.length, 'transactions');

    if (transactions.length === 0) {
      console.log('⚠️ [API] No transactions found for user');
      return NextResponse.json(
        { 
          message: 'No transactions found. Please upload and process documents first.',
          transactionCount: 0
        },
        { status: 400 }
      );
    }

    // Step 2: Analyze transactions to calculate credit factors
    console.log('\n📊 [STEP 2] Analyzing transactions for credit factors...');
    const factors = analyzeTransactionsForCreditScore(transactions);
    console.log('✅ [STEP 2] Credit factors calculated:', factors);

    // Step 3: Call AI flow to calculate credit score
    console.log('\n🤖 [STEP 3] Calling AI to calculate credit score...');
    const result = await calculateCreditScore(
      {
        ...factors,
        transactions: transactions as any[], // Pass transactions for reference
      },
      userId
    );
    console.log('✅ [STEP 3] AI calculation complete');
    console.log('🎯 [RESULT] Credit Score:', result.creditScore);
    console.log('🎯 [RESULT] Risk Grade:', result.riskGrade);

    // The calculateCreditScore function already saves to Firestore via saveCreditReport
    console.log('💾 [STEP 4] Report saved to Firestore automatically by AI flow');

    // Return the result
    return NextResponse.json({
      success: true,
      score: result.creditScore,
      grade: result.riskGrade,
      breakdown: result.scoreBreakdown,
      recommendations: result.recommendations,
      transactionCount: transactions.length,
      factors: factors,
    });

  } catch (error: any) {
    console.error('❌ [API] Error generating report:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
