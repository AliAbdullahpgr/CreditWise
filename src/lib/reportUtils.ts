
import { Transaction } from '@/lib/types';
import { CalculateCreditScoreOutput } from '@/ai/flows/calculate-credit-score';

// Utility: Format currency to PKR
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Utility: Format percentage
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Main data formatting function
export function formatReportData(transactions: Transaction[], creditScore: CalculateCreditScoreOutput) {
  const income = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  
  const monthlyData = groupByMonth(transactions);
  const categories = analyzeCategoryDistribution(transactions);
  const paymentMethods = analyzePaymentMethods(transactions);
  
  const documented = transactions.filter(t => (t as any).sourceDocumentId).length;
  const documentationRate = transactions.length > 0 ? (documented / transactions.length) * 100 : 0;
  
  // Approximate current balance from transactions
  const currentBalance = transactions.reduce((bal, t) => bal + (t.type === 'income' ? t.amount : -t.amount), 0);
  
  const assessmentPeriod = getAssessmentPeriod(transactions);
  const numMonths = assessmentPeriod.months > 0 ? assessmentPeriod.months : 1;

  const avgMonthlyIncome = totalIncome / numMonths;
  const avgMonthlyExpenses = totalExpenses / numMonths;

  return {
    summary: {
      reportId: generateReportId(creditScore.creditScore),
      reportDate: new Date().toISOString(),
      assessmentPeriod,
      businessId: (transactions[0] as any)?.userId || 'N/A',
    },
    creditScore: {
      total: creditScore.creditScore,
      riskLevel: getRiskLevel(creditScore.creditScore),
      components: getScoreComponents(creditScore),
      approvalProbability: calculateApprovalProbability(creditScore.creditScore),
    },
    loanEligibility: {
      maxAmount: calculateLoanEligibility(avgMonthlyIncome, getRiskLevel(creditScore.creditScore)),
      interestRate: suggestInterestRate(getRiskLevel(creditScore.creditScore)),
      monthlyRepayment: calculateRepaymentCapacity(avgMonthlyIncome),
      recommendedTenure: '12-18 months',
    },
    financialMetrics: {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      avgMonthlyProfit: netProfit / numMonths,
      currentBalance,
      emergencyBuffer: calculateEmergencyBuffer(currentBalance, avgMonthlyExpenses),
    },
    transactionAnalysis: {
      totalCount: transactions.length,
      avgDailyTransactions: transactions.length / (numMonths * 30),
      documentationRate,
      verifiedCount: documented,
      categories,
      paymentMethods,
    },
    monthlyBreakdown: monthlyData,
    insights: generateInsights(creditScore, totalIncome, totalExpenses, transactions),
  };
}

// Helper functions adapted from your provided JS code

function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 700) return 'low';
    if (score >= 500) return 'medium';
    return 'high';
}

function getScoreComponents(creditScore: CalculateCreditScoreOutput) {
    const rawFactors = (creditScore as any).factors || {};
    return {
        billPaymentHistory: (rawFactors.billPaymentHistory || 0) * 3, // scale to max 300
        incomeConsistency: (rawFactors.incomeConsistency || 0) * 2.5,
        expenseManagement: (rawFactors.expenseManagement || 0) * 2,
        financialGrowth: (rawFactors.financialGrowth || 0) * 1.5,
        transactionDiversity: (rawFactors.transactionDiversity || 0) * 1,
    };
}


function groupByMonth(transactions: Transaction[]) {
  const monthly: { [key: string]: { income: number; expenses: number; netProfit: number; transactionCount: number; balance: number } } = {};
  let runningBalance = 0;

  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  transactions.forEach(t => {
    const month = new Date(t.date).toISOString().slice(0, 7);
    
    if (!monthly[month]) {
      monthly[month] = { income: 0, expenses: 0, netProfit: 0, transactionCount: 0, balance: 0 };
    }
    
    if (t.type === 'income') {
      monthly[month].income += t.amount;
      runningBalance += t.amount;
    } else {
      monthly[month].expenses += t.amount;
      runningBalance -= t.amount;
    }
    
    monthly[month].transactionCount += 1;
    monthly[month].balance = runningBalance;
  });
  
  Object.keys(monthly).forEach(month => {
    monthly[month].netProfit = monthly[month].income - monthly[month].expenses;
  });
  
  return monthly;
}

function analyzeCategoryDistribution(transactions: Transaction[]) {
  const categories: { [key: string]: { count: number; amount: number; type: 'income' | 'expense' } } = {};
  
  transactions.forEach(t => {
    const category = t.category || 'Uncategorized';
    
    if (!categories[category]) {
      categories[category] = { count: 0, amount: 0, type: t.type };
    }
    
    categories[category].count += 1;
    categories[category].amount += t.amount;
  });
  
  return Object.entries(categories)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount);
}

function analyzePaymentMethods(transactions: Transaction[]) {
  const methods: { [key: string]: number } = {
    'Digital/Bank': 0,
    'Cash': 0,
  };
  
  transactions.forEach(t => {
    // A simple heuristic, can be improved with more data
    const method = (t as any).sourceDocumentId ? 'Digital/Bank' : 'Cash';
    methods[method] = (methods[method] || 0) + t.amount;
  });
  
  const total = Object.values(methods).reduce((a, b) => a + b, 0);
  
  return Object.entries(methods).map(([name, amount]) => ({
    name,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0,
  }));
}

function calculateLoanEligibility(avgMonthlyIncome: number, riskLevel: string): number {
  const multipliers = { low: 6, medium: 3, high: 1 };
  return Math.round(avgMonthlyIncome * (multipliers[riskLevel as keyof typeof multipliers] || 1));
}

function suggestInterestRate(riskLevel: string): string {
  const rates = { low: '14-16%', medium: '18-22%', high: '25-30%' };
  return rates[riskLevel as keyof typeof rates];
}

function calculateRepaymentCapacity(avgMonthlyIncome: number): number {
  return Math.round(avgMonthlyIncome * 0.45);
}

function calculateEmergencyBuffer(currentBalance: number, avgMonthlyExpenses: number): number {
  if (avgMonthlyExpenses <= 0) return 99; // effectively infinite
  return parseFloat((currentBalance / avgMonthlyExpenses).toFixed(1));
}

function calculateApprovalProbability(score: number): number {
  if (score >= 750) return Math.min(85 + (score - 750) / 25, 95);
  if (score >= 500) return 60 + (score - 500) / 10;
  return Math.max(20, score / 25);
}

function generateReportId(score: number): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `CRW-${date}-${score}`;
}

function getAssessmentPeriod(transactions: Transaction[]) {
  if (transactions.length === 0) return { start: 'N/A', end: 'N/A', months: 0 };
  
  const dates = transactions.map(t => new Date(t.date));
  const oldest = new Date(Math.min.apply(null, dates as any));
  const newest = new Date(Math.max.apply(null, dates as any));
  
  const months = (newest.getFullYear() - oldest.getFullYear()) * 12 + (newest.getMonth() - oldest.getMonth());

  return {
    start: oldest.toISOString().slice(0, 10),
    end: newest.toISOString().slice(0, 10),
    months: Math.max(1, months), // at least 1 month
  };
}

function generateInsights(creditScore: CalculateCreditScoreOutput, totalIncome: number, totalExpenses: number, transactions: Transaction[]) {
  const insights: { type: 'positive' | 'warning' | 'suggestion'; title: string; description: string; }[] = [];
  const profitMargin = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  
  if (creditScore.creditScore >= 750) {
    insights.push({
      type: 'positive',
      title: 'Excellent Credit Profile',
      description: `Your credit score of ${creditScore.creditScore} places you in the top tier, with high loan approval probability.`,
    });
  }
  
  if (profitMargin > 15) {
    insights.push({
      type: 'positive',
      title: 'Strong Profitability',
      description: `${profitMargin.toFixed(1)}% profit margin demonstrates excellent financial management.`,
    });
  }
  
  const factors = (creditScore as any).factors || {};

  if ((factors.expenseManagement || 0) < 70) {
      insights.push({
          type: 'suggestion',
          title: 'Improve Expense Management',
          description: 'Try to reduce non-essential spending to improve your savings rate and cash flow health.',
      });
  }
  
  const documented = transactions.filter(t => (t as any).sourceDocumentId).length;
  const docRate = transactions.length > 0 ? (documented / transactions.length) * 100 : 0;
  
  if (docRate < 70) {
    insights.push({
      type: 'warning',
      title: 'Low Documentation Rate',
      description: `Only ${docRate.toFixed(0)}% of transactions are from uploaded documents. Uploading more bills and statements can significantly boost your score.`,
    });
  }
  
  return insights;
}
