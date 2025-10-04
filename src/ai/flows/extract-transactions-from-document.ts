
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

const TransactionSchema = z.object({
  id: z.string().describe('A unique identifier for the transaction (e.g., a UUID).'),
  date: z.string().describe('The date of the transaction (e.g., YYYY-MM-DD).'),
  merchant: z.string().describe('The name of the client or merchant.'),
  amount: z.number().describe('The transaction amount. Negative for purchases/transfers out, positive for deposits/transfers in.'),
  type: z.enum(['income', 'expense']).describe('The type of transaction.'),
  category: z.string().describe('A suitable category for the transaction (e.g., Purchase, Deposit, Transfer, Gig Work, Utilities).'),
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
  
  Analyze the following document and extract all transactions. Do not include summary totals.
  For each transaction, determine if it is 'income' or 'expense' based on the amount and description.
  Assign a unique ID to each transaction.
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
   console.log('\n🤖 [AI FLOW START] Extract transactions from document');
   console.log('👤 [USER ID]', userId);
   console.log('📝 [DOCUMENT ID]', documentId);
   console.log('📸 [INPUT] Data URI length:', input.document.length, 'chars');
   
   try {
    console.log('🧠 [GEMINI] Sending request to Google Gemini AI...');
    const startTime = Date.now();
    const output = await extractTransactionsFlow(input);
    const endTime = Date.now();
    console.log('✅ [GEMINI] AI response received in', (endTime - startTime) / 1000, 'seconds');
    console.log('📊 [AI OUTPUT] Raw transactions count:', output.transactions.length);
    
    // Assign UUIDs if AI didn't provide them
    console.log('🎯 [PROCESSING] Assigning UUIDs to transactions...');
    const transactionsWithIds = output.transactions.map((t, index) => {
      const txId = t.id || crypto.randomUUID();
      console.log(`  • Transaction ${index + 1}: ${t.merchant} - $${t.amount} (${t.type})`);
      return {...t, id: txId};
    });

    // Save transactions to Firestore
    if (userId && transactionsWithIds.length > 0) {
      console.log('💾 [FIRESTORE] Saving', transactionsWithIds.length, 'transaction(s) to Firestore...');
      await saveTransactions(userId, transactionsWithIds, documentId);
      console.log('✅ [FIRESTORE] Transactions saved successfully');
      
      // Update document status
      console.log('📋 [STATUS UPDATE] Marking document as processed...');
      await updateDocumentStatus(
        documentId,
        'processed',
        transactionsWithIds.length
      );
      console.log('✅ [STATUS UPDATE] Document marked as processed with', transactionsWithIds.length, 'transactions');
    } else {
       // Still mark as processed even if no transactions found
       console.log('⚠️ [NO TRANSACTIONS] No transactions extracted, marking as processed anyway');
       await updateDocumentStatus(
        documentId,
        'processed',
        0
      );
      console.log('✅ [STATUS UPDATE] Document marked as processed with 0 transactions');
    }
    
    console.log('✅ [AI FLOW COMPLETE] Returning', transactionsWithIds.length, 'transaction(s)');
    return { transactions: transactionsWithIds };
  } catch (error) {
    console.error('❌ [AI FLOW ERROR] Processing failed');
    console.error('🔍 [ERROR DETAILS]', error);
    
    // Update document with error status
    if (documentId) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown AI processing error';
      console.log('⚠️ [ERROR RECOVERY] Updating document status to failed...');
      await updateDocumentStatus(
        documentId,
        'failed',
        0,
        errorMessage
      );
      console.log('❌ [STATUS UPDATE] Document marked as failed:', errorMessage);
    }
    // Re-throw the error to be caught by the client
    throw error;
  }
}
