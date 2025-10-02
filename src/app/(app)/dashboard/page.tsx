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
import { transactions, userFinancials, documents } from "@/lib/data";
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

export default function DashboardPage() {
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
              Your Credit Score
            </CardTitle>
            <CardDescription>
              Updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <ScoreGauge value={userFinancials.creditScore} />
          </CardContent>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-headline">Recent Activity</CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link href="/transactions">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <ul className="space-y-3">
                  {transactions.slice(0, 3).map((t) => (
                     <li key={t.id} className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                         {t.type === 'income' ? <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" /> : <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{t.merchant}</p>
                        <p className="text-xs text-muted-foreground">{t.date}</p>
                      </div>
                      <p className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(t.amount))}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent transactions.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5 lg:gap-8">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Score History</CardTitle>
            <CardDescription>
              Your credit score trend over the last 6 months.
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
        <CardHeader>
          <CardTitle className="font-headline">Recent Transactions</CardTitle>
          <CardDescription>
            A list of your most recent income and expenses.
          </CardDescription>
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
              {transactions.length > 0 ? (
                transactions.slice(0, 7).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.merchant}</div>
                      <div className="text-sm text-muted-foreground md:hidden">
                        {transaction.date}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {transaction.date}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No transactions yet.
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
