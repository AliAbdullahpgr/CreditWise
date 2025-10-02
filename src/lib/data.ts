import { Transaction, Document, CreditReport } from "./types";

export const userFinancials = {
  creditScore: 750,
  avgMonthlyIncome: 2500,
  avgMonthlyExpense: 1800,
  savingsRate: 28,
  paymentConsistency: 95,
};

export const transactions: Transaction[] = [
  { id: 'txn1', date: '2024-07-20', merchant: 'Grocery Store', amount: 55.4, type: 'expense', category: 'Food', status: 'cleared' },
  { id: 'txn2', date: '2024-07-19', merchant: 'Client Payment', amount: 500, type: 'income', category: 'Services', status: 'cleared' },
  { id: 'txn3', date: '2024-07-18', merchant: 'Electricity Bill', amount: 75, type: 'expense', category: 'Utilities', status: 'cleared' },
  { id: 'txn4', date: '2024-07-18', merchant: 'Bus Fare', amount: 5, type: 'expense', category: 'Transport', status: 'cleared' },
  { id: 'txn5', date: '2024-07-17', merchant: 'Online Sale', amount: 120, type: 'income', category: 'Sales', status: 'cleared' },
  { id: 'txn6', date: '2024-07-16', merchant: 'Restaurant', amount: 25, type: 'expense', category: 'Food', status: 'cleared' },
  { id: 'txn7', date: '2024-07-15', merchant: 'Office Supplies', amount: 35.5, type: 'expense', category: 'Supplies', status: 'cleared' },
  { id: 'txn8', date: '2024-07-15', merchant: 'Gig Work Payment', amount: 250, type: 'income', category: 'Gig Work', status: 'cleared' },
  { id: 'txn9', date: '2024-07-14', merchant: 'Rent Payment', amount: 300, type: 'expense', category: 'Rent', status: 'cleared' },
  { id: 'txn10', date: '2024-07-13', merchant: 'Mobile Top-up', amount: 10, type: 'expense', category: 'Utilities', status: 'cleared' },
  { id: 'txn11', date: '2024-07-12', merchant: 'Market Stall Fees', amount: 20, type: 'expense', category: 'Inventory', status: 'cleared' },
  { id: 'txn12', date: '2024-07-11', merchant: 'Remittance from Family', amount: 100, type: 'income', category: 'Remittances', status: 'cleared' },
];

export const documents: Document[] = [
    { id: 'doc1', name: 'receipt-2024-07-20.jpg', uploadDate: '2024-07-20', type: 'receipt', status: 'processed' },
    { id: 'doc2', name: 'utility-bill-july.pdf', uploadDate: '2024-07-18', type: 'utility bill', status: 'processed' },
    { id: 'doc3', name: 'easypaisa-statement.png', uploadDate: '2024-07-17', type: 'wallet statement', status: 'pending' },
    { id: 'doc4', name: 'IMG_2034.jpg', uploadDate: '2024-07-16', type: 'receipt', status: 'failed' },
    { id: 'doc5', name: 'receipt-market.jpg', uploadDate: '2024-07-15', type: 'receipt', status: 'processed' },
];

export const creditReports: CreditReport[] = [
    { id: 'rep-asdf-1234', generationDate: '2024-07-20', score: 750, grade: 'A', url: '#' },
    { id: 'rep-qwer-5678', generationDate: '2024-06-20', score: 720, grade: 'B', url: '#' },
    { id: 'rep-zxcv-9012', generationDate: '2024-05-20', score: 700, grade: 'B', url: '#' },
    { id: 'rep-yuio-3456', generationDate: '2024-04-20', score: 680, grade: 'B', url: '#' },
];
