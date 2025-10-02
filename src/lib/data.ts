import { Transaction, Document, CreditReport } from "./types";

export const userFinancials = {
  creditScore: 750,
  avgMonthlyIncome: 2500,
  avgMonthlyExpense: 1800,
  savingsRate: 28,
  paymentConsistency: 85,
  // Alternative Credit Score Factors (for demo purposes)
  billPaymentHistory: 85,
  incomeConsistency: 80,
  expenseManagement: 75,
  financialGrowth: 70,
  transactionDiversity: 65,
};

export const transactions: Transaction[] = [
  {
    id: "txn-001",
    date: "2025-09-28",
    merchant: "Digital Services Payment",
    amount: 500,
    type: "income",
    category: "gig_work",
    status: "cleared",
  },
  {
    id: "txn-002",
    date: "2025-09-27",
    merchant: "Local Market",
    amount: 45.50,
    type: "expense",
    category: "food",
    status: "cleared",
  },
  {
    id: "txn-003",
    date: "2025-09-26",
    merchant: "Electricity Company",
    amount: 120,
    type: "expense",
    category: "utilities",
    status: "cleared",
  },
  {
    id: "txn-004",
    date: "2025-09-25",
    merchant: "Rent Payment",
    amount: 600,
    type: "expense",
    category: "rent",
    status: "cleared",
  },
  {
    id: "txn-005",
    date: "2025-09-24",
    merchant: "Freelance Client",
    amount: 800,
    type: "income",
    category: "services",
    status: "cleared",
  },
  {
    id: "txn-006",
    date: "2025-09-23",
    merchant: "Transport Pass",
    amount: 35,
    type: "expense",
    category: "transport",
    status: "cleared",
  },
  {
    id: "txn-007",
    date: "2025-09-22",
    merchant: "Family Remittance",
    amount: 200,
    type: "income",
    category: "remittances",
    status: "cleared",
  },
  {
    id: "txn-008",
    date: "2025-09-20",
    merchant: "Grocery Store",
    amount: 85.75,
    type: "expense",
    category: "food",
    status: "cleared",
  },
];

export const documents: Document[] = [
  {
    id: "doc-001",
    name: "september-electricity-bill.pdf",
    uploadDate: "2025-09-28",
    type: "utility bill",
    status: "processed",
  },
  {
    id: "doc-002",
    name: "freelance-invoice-sept.jpg",
    uploadDate: "2025-09-25",
    type: "receipt",
    status: "processed",
  },
  {
    id: "doc-003",
    name: "mobile-wallet-statement.pdf",
    uploadDate: "2025-09-20",
    type: "wallet statement",
    status: "pending",
  },
];

export const creditReports: CreditReport[] = [
  {
    id: "CR-2025-001",
    generationDate: "2025-09-15",
    score: 750,
    grade: "B",
    url: "/reports/CR-2025-001.pdf",
  },
  {
    id: "CR-2025-002",
    generationDate: "2025-08-10",
    score: 710,
    grade: "B",
    url: "/reports/CR-2025-002.pdf",
  },
];
