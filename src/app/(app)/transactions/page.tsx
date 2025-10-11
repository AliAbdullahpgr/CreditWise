'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getTransactionsCollection } from '@/lib/firebase/collections';
import { useUser } from '@/lib/firebase/auth';
import { Loader2 } from 'lucide-react';

export default function TransactionsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log(
      '\n🔔 [TRANSACTIONS LISTENER] Setting up real-time listener for transactions'
    );
    console.log('👤 [USER ID]', user.uid);

    const transactionsCollection = getTransactionsCollection();
    const q = query(
      transactionsCollection,
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('🔔 [REAL-TIME UPDATE] Transactions collection changed!');
        console.log('📊 [COUNT]', snapshot.docs.length, 'transaction(s) found');
        const transactionData = snapshot.docs.map((doc, index) => {
          const data = doc.data() as Transaction;
          console.log(
            `  ${index + 1}. ${data.merchant} - $${data.amount} (${data.type})`
          );
          return data;
        });
        setTransactions(transactionData);
        setLoading(false);
        console.log('✅ [UI UPDATE] Transactions state updated in UI');
      },
      (error) => {
        console.error('❌ [LISTENER ERROR] Error fetching transactions:', error);
        setLoading(false);
      }
    );

    return () => {
      console.log('🔌 [CLEANUP] Unsubscribing from transactions listener');
      unsubscribe();
    };
  }, [user]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const allCategories = useMemo(
    () => [...new Set(transactions.map((t) => t.category))],
    [transactions]
  );

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesSearch = transaction.merchant
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesType =
          filterType === 'all' || transaction.type === filterType;
        const matchesCategory =
          filterCategory === 'all' || transaction.category === filterCategory;
        return matchesSearch && matchesType && matchesCategory;
      }),
    [transactions, searchTerm, filterType, filterCategory]
  );

  if (userLoading || loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
     return null; 
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Transactions</CardTitle>
        <CardDescription>
          View and manage all your income and expenses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Filter by merchant..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Merchant</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="font-medium">{transaction.merchant}</div>
                    <div className="text-sm text-muted-foreground md:hidden">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell capitalize">
                    {transaction.type}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No transactions found. Upload a document to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
}
