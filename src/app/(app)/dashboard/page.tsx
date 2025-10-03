
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreGauge } from "@/components/score-gauge";
import { ExpenseChart, ScoreHistoryChart } from "@/components/charts";
import { AlternativeCreditScoreInfo } from "@/components/alternative-credit-info";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { userFinancials } from "@/lib/data";
import { Transaction, Document } from '@/lib/types';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Landmark,
  PiggyBank,
  TrendingUp,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { auth } from '@/lib/firebase/config';
import { getTransactionsCollection, getDocumentsCollection } from '@/lib/firebase/collections';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

   useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : 'user-test-001'); // Fallback to mock user for demo
    });
    return () => unsubscribeAuth();
  }, []);

   useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const transactionsCollection = getTransactionsCollection();
    const documentsCollection = getDocumentsCollection();

    const transQuery = query(
      transactionsCollection,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const docQuery = query(
      documentsCollection,
      where('userId', '==', userId),
      orderBy('uploadDate', 'desc')
    );

    const unsubscribeTransactions = onSnapshot(transQuery, (snapshot) => {
      const transactionData = snapshot.docs.map(doc => doc.data() as Transaction);
      setTransactions(transactionData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    });

    const unsubscribeDocuments = onSnapshot(docQuery, (snapshot) => {
      const documentData = snapshot.docs.map(doc => doc.data() as Document);
      setDocuments(documentData);
    }, (error) => {
      console.error("Error fetching documents:", error);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeDocuments();
    };
  }, [userId]);


  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const latestDocument = documents
    .filter((d) => d.status === "processed")
    .sort(
      (a, b) =>
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    )[0];

  return (
    <div className="grid gap-6 md:gap-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        <Card className="md:col-span-1 flex flex-col items-center justify-center text-center">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Alternative Credit Score
            </CardTitle>
            <CardDescription>
              For informal economy workers • Updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <ScoreGauge value={userFinancials.creditScore} />
          </CardContent>
          <div className="px-6 pb-4 text-xs text-muted-foreground text-center">
            Not a FICO score. Designed for workers without traditional credit.
          </div>
        </Card>
        <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Monthly Income
              </CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(userFinancials.avgMonthlyIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                +10.2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Monthly Expenses
              </CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(userFinancials.avgMonthlyExpense)}
              </div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userFinancials.savingsRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                +2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Income Growth
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+15%</div>
              <p className="text-xs text-muted-foreground">
                Over last 3 months
              </p>
            </CardContent>
          </Card>
           <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-headline">Latest Processed Document</CardTitle>
            </CardHeader>
            <CardContent>
              {latestDocument ? (
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">{latestDocument.name}</p>
                      <p className="text-xs text-muted-foreground">Processed on {new Date(latestDocument.uploadDate).toLocaleDateString()}</p>
                    </div>
                     <Badge variant="default">Processed</Badge>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No documents processed yet.</p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        <AlternativeCreditScoreInfo />
        <ScoreBreakdown />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5 lg:gap-8">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Score History</CardTitle>
            <CardDescription>
              Your alternative credit score trend over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreHistoryChart />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Expense Breakdown</CardTitle>
            <CardDescription>
              How you spent your money this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Recent Transactions</CardTitle>
            <CardDescription>
              A list of your most recent income and expenses.
            </CardDescription>
          </div>
           <Button size="sm" variant="outline" asChild>
              <Link href="/transactions">View All</Link>
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.slice(0, 7).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.merchant}</div>
                      <div className="text-sm text-muted-foreground md:hidden">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No transactions yet. Upload a document to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
