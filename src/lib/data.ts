import { Transaction, Document, CreditReport } from "./types";

export const userFinancials = {
  creditScore: 0,
  avgMonthlyIncome: 0,
  avgMonthlyExpense: 0,
  savingsRate: 0,
  paymentConsistency: 0,
};

export const transactions: Transaction[] = [];

export const documents: Document[] = [];

export const creditReports: CreditReport[] = [];
