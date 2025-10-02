'use server';

/**
 * @fileOverview AI-powered transaction categorization flow.
 *
 * categorizeTransaction - A function that categorizes a transaction based on its data.
 * CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTransactionInputSchema = z.object({
  merchantName: z.string().describe('The name of the merchant or vendor.'),
  amount: z.number().describe('The transaction amount.'),
  description: z.string().describe('A description of the transaction.'),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.object({
  category: z.enum([
    'income',
    'expenses',
    'sales',
    'services',
    'gig_work',
    'remittances',
    'inventory',
    'rent',
    'utilities',
    'transport',
    'food',
    'supplies',
  ]).describe('The predicted category of the transaction.'),
  subcategory: z.string().describe('A more specific subcategory of the transaction.'),
  confidenceLevel: z.number().describe('A confidence score (0-1) for the categorization.'),
});
export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

export async function categorizeTransaction(input: CategorizeTransactionInput): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const categorizeTransactionPrompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  prompt: `You are a personal finance assistant that specializes in categorizing transactions.

  Given the following transaction information, determine the most appropriate category and subcategory.
  Also assign a confidence level (0-1) for your categorization.

  Merchant Name: {{{merchantName}}}
  Amount: {{{amount}}}
  Description: {{{description}}}

  Respond in JSON format.
  `,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await categorizeTransactionPrompt(input);
    return output!;
  }
);
