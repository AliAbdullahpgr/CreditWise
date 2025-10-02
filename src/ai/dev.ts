import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-transactions.ts';
import '@/ai/flows/calculate-credit-score.ts';
import '@/ai/flows/extract-transactions-from-document.ts';
