'use server';
/**
 * @fileOverview An AI flow for extracting multiple transactions from a document.
 *
 * - extractTransactionsFromDocument - A function that extracts transaction data from a text blob.
 * - ExtractTransactionsFromDocumentInput - The input type for the function.
 * - ExtractTransactionsFromDocumentOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { saveTransactions, updateDocumentStatus } from '@/lib/firebase/firestore';
import { Transaction } from '@/lib/types';


const TransactionSchema = z.object({
  id: z.string().describe('A unique identifier for the transaction.'),
  date: z.string().describe('The date of the transaction (e.g., YYYY-MM-DD).'),
  merchant: z.string().describe('The name of the client or merchant.'),
  amount: z.number().describe('The transaction amount. Negative for purchases/transfers out, positive for deposits/transfers in.'),
  type: z.enum(['income', 'expense']).describe('The type of transaction.'),
  category: z.string().describe('A suitable category for the transaction (e.g., Purchase, Deposit, Transfer).'),
  status: z.enum(['cleared', 'pending']).default('cleared'),
});

const ExtractTransactionsFromDocumentInputSchema = z.object({
  document: z.string().describe("A document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ExtractTransactionsFromDocumentInput = z.infer<typeof ExtractTransactionsFromDocumentInputSchema>;

const ExtractTransactionsFromDocumentOutputSchema = z.object({
  transactions: z.array(TransactionSchema),
});
export type ExtractTransactionsFromDocumentOutput = z.infer<typeof ExtractTransactionsFromDocumentOutputSchema>;

const extractTransactionsPrompt = ai.definePrompt({
  name: 'extractTransactionsPrompt',
  input: { schema: ExtractTransactionsFromDocumentInputSchema },
  output: { schema: ExtractTransactionsFromDocumentOutputSchema },
  prompt: `You are an expert at extracting structured transaction data from OCR text from a document.
  
  Analyze the following document and extract all transactions.
  For each transaction, determine if it is 'income' or 'expense' based on the amount and type.
  'Purchase' types or negative amounts are 'expense'. 'Deposit' types or positive amounts are 'income'.
  For 'Transfer' types, use the amount sign to determine if it is income or expense.

  Document:
  {{media url=document}}

  Respond in JSON format with a list of transactions.
  `,
});

const extractTransactionsFlow = ai.defineFlow(
  {
    name: 'extractTransactionsFlow',
    inputSchema: ExtractTransactionsFromDocumentInputSchema,
    outputSchema: ExtractTransactionsFromDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await extractTransactionsPrompt(input);
    return output || { transactions: [] };
  }
);

export async function extractTransactionsFromDocument(
  input: ExtractTransactionsFromDocumentInput,
  userId: string,
  documentId: string
): Promise<ExtractTransactionsFromDocumentOutput> {
   try {
    const output = await extractTransactionsFlow(input);
    
    // Save transactions to Firestore
    if (userId && output.transactions.length > 0) {
      const transactionsWithIds = output.transactions.map(t => ({...t, id: t.id || crypto.randomUUID()})) as Transaction[]
      await saveTransactions(userId, transactionsWithIds, documentId);
      
      // Update document status
      await updateDocumentStatus(
        documentId,
        'processed',
        output.transactions.length
      );
    } else {
       await updateDocumentStatus(
        documentId,
        'processed',
        0
      );
    }
    
    return output;
  } catch (error) {
    // Update document with error status
    if (documentId) {
      await updateDocumentStatus(
        documentId,
        'failed',
        0,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    throw error;
  }
}
