'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScoreGauge } from '@/components/score-gauge';
import { Transaction } from '@/lib/types';
import {
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  Clock,
  Package,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { analyzeTransactionsForCreditScore } from '@/lib/credit-analysis';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.uid, 'transactions'), orderBy('date', 'desc')) : null
  , [firestore, user]);
  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  // Calculate dashboard metrics
  const dashboardData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        creditScore: 0,
        pendingTransactions: 0,
        incomeVsExpenseData: [],
        topProducts: [],
        categoryData: [],
        recentTransactions: [],
      };
    }

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netProfit = totalIncome - totalExpense;

    // Count pending transactions
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

    // Calculate credit score
    const creditFactors = analyzeTransactionsForCreditScore(transactions);
    const creditScore = Math.round(
      creditFactors.billPaymentHistory * 0.30 +
      creditFactors.incomeConsistency * 0.25 +
      creditFactors.expenseManagement * 0.20 +
      creditFactors.financialGrowth * 0.15 +
      creditFactors.transactionDiversity * 0.10
    );

    // Income vs Expense by month
    const monthlyData = transactions.reduce((acc: any, t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        acc[monthKey].income += Math.abs(t.amount);
      } else {
        acc[monthKey].expense += Math.abs(t.amount);
      }
      
      return acc;
    }, {});

    const incomeVsExpenseData = Object.values(monthlyData)
      .sort((a: any, b: any) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months

    // Top selling products (by merchant for income)
    const productSales = transactions
      .filter(t => t.type === 'income')
      .reduce((acc: any, t) => {
        const merchant = t.merchant || 'Unknown';
        if (!acc[merchant]) {
          acc[merchant] = { merchant, total: 0, count: 0 };
        }
        acc[merchant].total += Math.abs(t.amount);
        acc[merchant].count += 1;
        return acc;
      }, {});

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 5);

    // Category-wise breakdown
    const categoryTotals = transactions.reduce((acc: any, t) => {
      const category = t.category || 'Uncategorized';
      const key = `${category}-${t.type}`;
      
      if (!acc[key]) {
        acc[key] = { name: category, value: 0, type: t.type };
      }
      acc[key].value += Math.abs(t.amount);
      
      return acc;
    }, {});

    const categoryData = Object.values(categoryTotals);

    // Recent transactions (top 5)
    const recentTransactions = [...transactions].slice(0, 5);

    return {
      totalIncome,
      totalExpense,
      netProfit,
      creditScore,
      pendingTransactions,
      incomeVsExpenseData,
      topProducts,
      categoryData,
      recentTransactions,
    };
  }, [transactions]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  if (isUserLoading || transactionsLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
     return null;
  }

  const { 
    totalIncome, 
    totalExpense, 
    netProfit, 
    creditScore, 
    pendingTransactions,
    incomeVsExpenseData,
    topProducts,
    categoryData,
    recentTransactions 
  } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial activity
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              All time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
            <p className="text-xs text-muted-foreground">
              All time spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Income - Expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{creditScore}</div>
            <p className="text-xs text-muted-foreground">
              Alternative score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Pending transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Score Gauge */}
      <Card>
        <CardHeader>
          <CardTitle>Alternative Credit Score</CardTitle>
          <CardDescription>
            For informal economy workers • Updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <ScoreGauge value={creditScore} />
        </CardContent>
        <div className="px-6 pb-4 text-xs text-muted-foreground text-center">
          Not a FICO score. Designed for workers without traditional credit.
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Income vs Expense Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expense</CardTitle>
            <CardDescription>Monthly comparison (Last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            {incomeVsExpenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeVsExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Expenses and income by category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Recent Transactions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Income Sources
            </CardTitle>
            <CardDescription>Top 5 revenue generating sources</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{product.merchant}</p>
                      <p className="text-xs text-muted-foreground">{product.count} transactions</p>
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      {formatCurrency(product.total)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No income data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-xs">
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {transaction.merchant}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === 'income' ? 'default' : 'secondary'}
                          className={transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'}
                        >
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No transactions yet. Upload documents to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View All Link */}
      {recentTransactions.length > 0 && (
        <div className="flex justify-center">
          <Link href="/transactions" className="text-sm text-primary hover:underline">
            View all transactions →
          </Link>
        </div>
      )}
    </div>
  );
}
