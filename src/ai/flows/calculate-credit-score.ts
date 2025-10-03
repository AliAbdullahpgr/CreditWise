'use server';

/**
 * @fileOverview Alternative Credit Score Calculation for Informal Economy Workers
 * 
 * IMPORTANT: This is NOT a FICO or traditional credit score!
 * 
 * This scoring model is specifically designed for individuals in the informal economy
 * who lack traditional credit products (credit cards, bank loans, mortgages).
 * 
 * Target Users:
 * - Gig workers and freelancers
 * - Street vendors and small merchants
 * - Cash-based economy workers
 * - Mobile wallet users
 * - Anyone without traditional banking history
 * 
 * Why Traditional FICO Doesn't Work:
 * - Requires credit cards (which target users don't have)
 * - Focuses on debt utilization (irrelevant for cash economy)
 * - Ignores income patterns and expense discipline
 * - Excludes 2+ billion people worldwide
 * 
 * Our Alternative Factors (0-1000 scale):
 * - Payment History (30%): Rent, utilities, mobile bills
 * - Income Consistency (25%): Regular earning patterns
 * - Expense Management (20%): Spending discipline & savings
 * - Financial Growth (15%): Income trends over time
 * - Transaction Diversity (10%): Multiple income sources
 * 
 * Functions:
 * - calculateCreditScore - Calculates alternative credit score
 * - CalculateCreditScoreInput - Input type with 6 factor scores
 * - CalculateCreditScoreOutput - Output with score, grade, breakdown
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { saveCreditReport } from '@/lib/firebase/firestore';
import { CreditReport } from '@/lib/types';
import {z as zod} from 'zod';

const CalculateCreditScoreInputSchema = z.object({
  billPaymentHistory: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Payment history for rent, utilities, mobile bills (0-100). Weight: 30%. Most important factor.'
    ),
  incomeConsistency: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Regularity and consistency of income patterns (0-100). Weight: 25%. Measures earning stability.'
    ),
  expenseManagement: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Expense-to-income ratio and savings behavior (0-100). Weight: 20%. Shows financial discipline.'
    ),
  financialGrowth: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Income growth trend over 3-6 months (0-100). Weight: 15%. Indicates improving financial health.'
    ),
  transactionDiversity: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Variety of income sources and transaction types (0-100). Weight: 10%. Shows diversified income.'
    ),
  transactions: zod.array(zod.any()).optional(),
});
export type CalculateCreditScoreInput = z.infer<typeof CalculateCreditScoreInputSchema>;

const CalculateCreditScoreOutputSchema = z.object({
  creditScore: z
    .number()
    .min(0)
    .max(1000)
    .describe('Alternative Credit Score (0-1000) for informal economy workers.'),
  riskGrade: z
    .string()
    .describe(
      'Risk grade: A (800+), B+ (700-799), B (600-699), C (500-599), D (<500)'
    ),
  scoreBreakdown: z
    .string()
    .describe('Detailed breakdown showing how each factor contributed to the final score.'),
  recommendations: z
    .string()
    .describe('Personalized recommendations for improving the alternative credit score.'),
  scoreType: z
    .string()
...
  'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { saveCreditReport } from '@/lib/firebase/firestore';
import { CreditReport } from '@/lib/types';
import {z as zod} from 'zod';

const CalculateCreditScoreInputSchema = z.object({
  billPaymentHistory: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Payment history for rent, utilities, mobile bills (0-100). Weight: 30%. Most important factor.'
    ),
  incomeConsistency: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Regularity and consistency of income patterns (0-100). Weight: 25%. Measures earning stability.'
    ),
  expenseManagement: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Expense-to-income ratio and savings behavior (0-100). Weight: 20%. Shows financial discipline.'
    ),
  financialGrowth: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Income growth trend over 3-6 months (0-100). Weight: 15%. Indicates improving financial health.'
    ),
  transactionDiversity: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Variety of income sources and transaction types (0-100). Weight: 10%. Shows diversified income.'
    ),
  transactions: zod.array(zod.any()).optional(),
});
export type CalculateCreditScoreInput = z.infer<typeof CalculateCreditScoreInputSchema>;

const CalculateCreditScoreOutputSchema = z.object({
  creditScore: z
    .number()
    .min(0)
    .max(1000)
    .describe('Alternative Credit Score (0-1000) for informal economy workers.'),
  riskGrade: z
    .string()
    .describe(
      'Risk grade: A (800+), B+ (700-799), B (600-699), C (500-599), D (<500)'
    ),
  scoreBreakdown: z
    .string()
    .describe('Detailed breakdown showing how each factor contributed to the final score.'),
  recommendations: z
    .string()
    .describe('Personalized recommendations for improving the alternative credit score.'),
  scoreType: z
    .string()
    .default('Alternative Credit Score')
    .describe('Type of credit score - always "Alternative Credit Score" for informal economy'),
});
export type CalculateCreditScoreOutput = z.infer<typeof CalculateCreditScoreOutputSchema>;

const prompt = ai.definePrompt({
  name: 'calculateCreditScorePrompt',
  input: {schema: CalculateCreditScoreInputSchema},
  output: {schema: CalculateCreditScoreOutputSchema},
  prompt: `You are an AI credit analyst specializing in Alternative Credit Scoring for the informal economy.

  IMPORTANT: This is NOT a traditional FICO score. This is an Alternative Credit Score designed for:
  - Gig workers and freelancers
  - Street vendors and small merchants  
  - Cash-based economy workers
  - Mobile wallet users
  - Anyone without traditional credit cards or bank loans

  Traditional FICO scores don't work for these users because they require credit cards, loans, and banking history.
  Our alternative model evaluates financial behavior through different lenses.

  Scoring Factors (0-1000 scale):
  1. Bill Payment History (30%): Rent, utilities, mobile bills - on-time payment patterns
  2. Income Consistency (25%): Regular earning patterns, variance in monthly income
  3. Expense Management (20%): Spending discipline & savings behavior, financial discipline
  4. Financial Growth (15%): Income trend over 3-6 months, positive trajectory
  5. Transaction Diversity (10%): Variety of income sources, transaction types

  Algorithm:
  1. Take each factor score (0-100) provided in input
  2. Apply weighted average: (BPH*0.30) + (IC*0.25) + (EM*0.20) + (FG*0.15) + (TD*0.10)
  3. Scale result to 0-1000 range
  4. Assign risk grade:
     - A (800-1000): Excellent - Very low risk
     - B+ (700-799): Good - Low risk
     - B (600-699): Fair - Moderate risk
     - C (500-599): Needs improvement - Higher risk
     - D (<500): Poor - High risk

  Input Scores:
  Bill Payment History: {{{billPaymentHistory}}} (Weight: 30%)
  Income Consistency: {{{incomeConsistency}}} (Weight: 25%)
  Expense Management: {{{expenseManagement}}} (Weight: 20%)
  Financial Growth: {{{financialGrowth}}} (Weight: 15%)
  Transaction Diversity: {{{transactionDiversity}}} (Weight: 10%)

  Tasks:
  1. Calculate the Alternative Credit Score (0-1000)
  2. Assign appropriate risk grade (A/B+/B/C/D)
  3. Provide detailed breakdown:
     - Show how each factor contributed (e.g., "Bill Payment: 85/100 * 30% = 25.5 points")
     - Show weighted sum and scaling to 0-1000
     - Explain what the score means for loan eligibility
  4. Provide 3-5 personalized recommendations:
     - Focus on lowest scoring factors
     - Give actionable steps (e.g., "Pay utility bills on time for 3 months")
     - Explain potential score improvement
  5. Include 'scoreType': 'Alternative Credit Score' in response

  Return data in JSON format matching the schema.
`,
});

const calculateCreditScoreFlow = ai.defineFlow(
  {
    name: 'calculateCreditScoreFlow',
    inputSchema: CalculateCreditScoreInputSchema,
    outputSchema: CalculateCreditScoreOutputSchema,
  },
  async (input: CalculateCreditScoreInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function calculateCreditScore(
  input: CalculateCreditScoreInput,
  userId: string  // Add this parameter
): Promise<CalculateCreditScoreOutput> {
  const output = await calculateCreditScoreFlow(input);
  
  // Save credit report to Firestore
  if (userId) {
    const report: CreditReport = {
      id: crypto.randomUUID(),
      generationDate: new Date().toISOString(),
      score: output.creditScore,
      grade: output.riskGrade as 'A' | 'B' | 'C' | 'D',
      url: '', // Generate PDF and upload to Storage if needed
    };
    
    await saveCreditReport(
      userId,
      report,
      {}, // factors
      input.transactions?.length || 0,
      input.transactions?.[0]?.date || '',
      input.transactions?.[input.transactions?.length - 1]?.date || ''
    );
  }
  
  return output;
}
