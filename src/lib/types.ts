export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  status: 'cleared' | 'pending';
};

export type Document = {
  id:string;
  name: string;
  uploadDate: string;
  type: 'receipt' | 'utility bill' | 'wallet statement';
  status: 'processed' | 'pending' | 'failed';
};

export type CreditReport = {
  id: string;
  generationDate: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  url: string;
};
