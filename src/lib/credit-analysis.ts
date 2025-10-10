/**
 * @fileOverview Helper functions for credit score calculation
 * Analyzes transaction data to calculate the 5 alternative credit factors
 */

import { Transaction } from '@/lib/types';

export interface CreditFactors {
  billPaymentHistory: number;
  incomeConsistency: number;
  expenseManagement: number;
  financialGrowth: number;
  transactionDiversity: number;
}

/**
 * Analyzes transactions to calculate credit scoring factors
 * Returns scores from 0-100 for each factor
 */
export function analyzeTransactionsForCreditScore(transactions: Transaction[]): CreditFactors {
  console.log('📊 [ANALYSIS] Starting credit factor analysis for', transactions.length, 'transactions');

  if (transactions.length === 0) {
    console.log('⚠️ [ANALYSIS] No transactions found, returning default scores');
    return {
      billPaymentHistory: 50,
      incomeConsistency: 50,
      expenseManagement: 50,
      financialGrowth: 50,
      transactionDiversity: 50,
    };
  }

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 1. Bill Payment History (30%) - Focus on regular payments like rent, utilities, mobile
  const billPaymentHistory = calculateBillPaymentHistory(sortedTransactions);
  console.log('💡 [FACTOR 1] Bill Payment History:', billPaymentHistory);

  // 2. Income Consistency (25%) - Regularity of income
  const incomeConsistency = calculateIncomeConsistency(sortedTransactions);
  console.log('💡 [FACTOR 2] Income Consistency:', incomeConsistency);

  // 3. Expense Management (20%) - Spending discipline and savings
  const expenseManagement = calculateExpenseManagement(sortedTransactions);
  console.log('💡 [FACTOR 3] Expense Management:', expenseManagement);

  // 4. Financial Growth (15%) - Income trend over time
  const financialGrowth = calculateFinancialGrowth(sortedTransactions);
  console.log('💡 [FACTOR 4] Financial Growth:', financialGrowth);

  // 5. Transaction Diversity (10%) - Variety of income sources
  const transactionDiversity = calculateTransactionDiversity(sortedTransactions);
  console.log('💡 [FACTOR 5] Transaction Diversity:', transactionDiversity);

  const factors: CreditFactors = {
    billPaymentHistory,
    incomeConsistency,
    expenseManagement,
    financialGrowth,
    transactionDiversity,
  };

  console.log('✅ [ANALYSIS] Credit factors calculated:', factors);
  return factors;
}

/**
 * Calculate bill payment history score (0-100)
 * Looks for regular payments like rent, utilities, mobile bills
 */
function calculateBillPaymentHistory(transactions: Transaction[]): number {
  const billCategories = ['utilities', 'rent', 'phone', 'internet', 'subscription'];
  
  const billTransactions = transactions.filter(t => 
    t.type === 'expense' && 
    billCategories.some(cat => t.category?.toLowerCase().includes(cat))
  );

  if (billTransactions.length === 0) return 40; // Low score if no bill payments found

  // Check for regularity - bills paid monthly
  const monthlyBills = groupByMonth(billTransactions);
  const consistency = Math.min(100, (Object.keys(monthlyBills).length / 3) * 100); // Good if at least 3 months
  
  return Math.round(consistency);
}

/**
 * Calculate income consistency score (0-100)
 * Measures regularity and stability of income
 */
function calculateIncomeConsistency(transactions: Transaction[]): number {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  
  if (incomeTransactions.length === 0) return 30;

  const monthlyIncome = groupByMonth(incomeTransactions);
  const monthlyTotals = Object.values(monthlyIncome).map(txns => 
    txns.reduce((sum, t) => sum + t.amount, 0)
  );

  if (monthlyTotals.length === 0) return 30;

  // Calculate coefficient of variation (lower is better)
  const mean = monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length;
  const variance = monthlyTotals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / monthlyTotals.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 1;

  // Convert to 0-100 score (lower CV = higher score)
  const score = 100 - (cv * 50);
  
  // Ensure score is always between 0 and 100
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Calculate expense management score (0-100)
 * Measures spending discipline and savings behavior
 */
function calculateExpenseManagement(transactions: Transaction[]): number {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (income === 0) return 40;

  const expenseRatio = expenses / income;
  
  // Good: < 0.7 (saving 30%+), Fair: 0.7-0.9, Poor: > 0.9
  let score: number;
  if (expenseRatio < 0.7) {
    score = 100 - (expenseRatio * 70); // 100-49 range
  } else if (expenseRatio < 0.9) {
    score = 60 - ((expenseRatio - 0.7) * 100); // 60-40 range
  } else {
    score = Math.max(20, 40 - ((expenseRatio - 0.9) * 100)); // 40-20 range
  }

  // Ensure score is always between 0 and 100
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Calculate financial growth score (0-100)
 * Measures income trend over time
 */
function calculateFinancialGrowth(transactions: Transaction[]): number {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  
  if (incomeTransactions.length < 2) return 50;

  const monthlyIncome = groupByMonth(incomeTransactions);
  const months = Object.keys(monthlyIncome).sort();
  
  if (months.length < 2) return 50;

  const firstMonthIncome = monthlyIncome[months[0]].reduce((sum, t) => sum + t.amount, 0);
  const lastMonthIncome = monthlyIncome[months[months.length - 1]].reduce((sum, t) => sum + t.amount, 0);

  if (firstMonthIncome === 0) return 50;

  const growthRate = (lastMonthIncome - firstMonthIncome) / firstMonthIncome;
  
  // Convert growth rate to score
  // Positive growth: 60-100, Stable: 40-60, Declining: 20-40
  let score: number;
  if (growthRate > 0.1) {
    score = 60 + (growthRate * 200);
  } else if (growthRate > -0.1) {
    score = 50 + (growthRate * 100);
  } else {
    score = 50 + (growthRate * 100);
  }

  // Ensure score is always between 0 and 100
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Calculate transaction diversity score (0-100)
 * Measures variety of income sources
 */
function calculateTransactionDiversity(transactions: Transaction[]): number {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  
  if (incomeTransactions.length === 0) return 30;

  // Count unique categories and merchants
  const uniqueCategories = new Set(incomeTransactions.map(t => t.category).filter(Boolean));
  const uniqueMerchants = new Set(incomeTransactions.map(t => t.merchant).filter(Boolean));
  
  const diversityScore = (uniqueCategories.size * 20) + (uniqueMerchants.size * 10);
  
  // Ensure score is always between 0 and 100
  return Math.round(Math.max(0, Math.min(100, diversityScore)));
}

/**
 * Helper: Group transactions by month
 */
function groupByMonth(transactions: Transaction[]): Record<string, Transaction[]> {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(transaction);
    
    return groups;
  }, {} as Record<string, Transaction[]>);
}
