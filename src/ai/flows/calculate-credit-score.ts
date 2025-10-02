'use server';

/**
 * @fileOverview A credit score calculation AI agent.
 *
 * - calculateCreditScore - A function that handles the credit score calculation process.
 * - CalculateCreditScoreInput - The input type for the calculateCreditScore function.
 * - CalculateCreditScoreOutput - The return type for the calculateCreditScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateCreditScoreInputSchema = z.object({
  incomeConsistency: z
    .number()
    .describe(
      'A score (0-100) representing the consistency of the user\u2019s income. Higher values indicate more consistent income.'
    ),
  expenseManagement: z
    .number()
    .describe(
      'A score (0-100) representing how well the user manages their expenses. Higher values indicate better expense management.'
    ),
  billPaymentHistory: z
    .number()
    .describe(
      'A score (0-100) representing the user\u2019s bill payment history. Higher values indicate a better payment history.'
    ),
  financialGrowth: z
    .number()
    .describe(
      'A score (0-100) representing the user\u2019s financial growth. Higher values indicate better financial growth.'
    ),
  transactionDiversity: z
    .number()
    .describe(
      'A score (0-100) representing the diversity of the user\u2019s transactions. Higher values indicate more diverse transactions.'
    ),
  financialDiscipline: z
    .number()
    .describe(
      'A score (0-100) representing the user\u2019s financial discipline. Higher values indicate better financial discipline.'
    ),
});
export type CalculateCreditScoreInput = z.infer<typeof CalculateCreditScoreInputSchema>;

const CalculateCreditScoreOutputSchema = z.object({
  creditScore: z
    .number()
    .describe('The calculated credit score (0-1000).'),
  riskGrade: z
    .string()
    .describe(
      'The risk grade assigned to the user based on their credit score (A/B/C/D).'
    ),
  scoreBreakdown: z
    .string()
    .describe('A detailed breakdown of how the credit score was calculated.'),
  recommendations: z
    .string()
    .describe('Personalized recommendations for improving the credit score.'),
});
export type CalculateCreditScoreOutput = z.infer<typeof CalculateCreditScoreOutputSchema>;

export async function calculateCreditScore(
  input: CalculateCreditScoreInput
): Promise<CalculateCreditScoreOutput> {
  return calculateCreditScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateCreditScorePrompt',
  input: {schema: CalculateCreditScoreInputSchema},
  output: {schema: CalculateCreditScoreOutputSchema},
  prompt: `You are an AI assistant that calculates a credit score based on the user's financial data.

  The credit score is calculated based on the following factors:

  1. Income Consistency (25%): variance in monthly income, regularity
  2. Expense Management (20%): expense-to-income ratio, savings pattern
  3. Bill Payment History (20%): utility bills paid on time, regularity
  4. Financial Growth (15%): income trend over time (3-6 months)
  5. Transaction Diversity (10%): variety of income sources
  6. Financial Discipline (10%): avoiding overdrafts, maintaining buffer

  Algorithm steps:

  1. Calculate each factor score (0-100) - this is provided to you in the input
  2. Apply weighted average using weights above
  3. Scale to 0-1000
  4. Assign risk grade: A (800+), B (600-799), C (400-599), D (<400)

  Based on the input:
  Income Consistency: {{{incomeConsistency}}}
  Expense Management: {{{expenseManagement}}}
  Bill Payment History: {{{billPaymentHistory}}}
  Financial Growth: {{{financialGrowth}}}
  Transaction Diversity: {{{transactionDiversity}}}
  Financial Discipline: {{{financialDiscipline}}}

  1. Calculate the credit score.
  2. Assign a risk grade based on the credit score.
  3. Provide a detailed breakdown showing how the score was calculated.
  4. Provide personalized recommendations for improving the credit score.

  Make sure to return the data in JSON format.
`,
});

const calculateCreditScoreFlow = ai.defineFlow(
  {
    name: 'calculateCreditScoreFlow',
    inputSchema: CalculateCreditScoreInputSchema,
    outputSchema: CalculateCreditScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
