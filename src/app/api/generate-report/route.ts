import { NextRequest, NextResponse } from 'next/server';
import { getUserTransactions } from '@/lib/firebase/firestore';
import { analyzeTransactionsForCreditScore } from '@/lib/credit-analysis';
import { calculateCreditScore } from '@/ai/flows/calculate-credit-score';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Step 1: Fetch user transactions
    const transactions = await getUserTransactions(userId);

    if (transactions.length === 0) {
      return NextResponse.json(
        { 
          message: 'No transactions found. Please upload and process documents first.',
          transactionCount: 0
        },
        { status: 400 }
      );
    }

    // Step 2: Analyze transactions to calculate credit factors
    const factors = analyzeTransactionsForCreditScore(transactions);

    // Step 3: Call AI flow to calculate credit score
    const result = await calculateCreditScore(
      {
        ...factors,
        transactions: transactions as any[], // Pass transactions for reference
      },
      userId
    );

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
