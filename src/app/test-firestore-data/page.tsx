'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export default function TestFirestorePage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (step: string, status: TestResult['status'], message: string, data?: any) => {
    setTestResults(prev => [...prev, { step, status, message, data }]);
  };

  const testClientSideQuery = async () => {
    if (!user) {
      addResult('Auth Check', 'error', 'No user logged in', null);
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      addResult('Authentication', 'success', `User: ${user.uid}`, { 
        uid: user.uid,
        email: user.email 
      });

      // Dynamic import to avoid server-side issues
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const firestore = getFirestore();

      // Test 1: Fetch Documents
      addResult('Test 1', 'pending', 'Fetching documents...', null);
      const docsRef = collection(firestore, 'users', user.uid, 'documents');
      const docsSnapshot = await getDocs(docsRef);
      
      const documents = docsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      addResult('Documents Query', 
        docsSnapshot.size > 0 ? 'success' : 'error',
        `Found ${docsSnapshot.size} documents`, 
        { 
          count: docsSnapshot.size,
          documents: documents.slice(0, 3) // First 3 only
        }
      );

      // Test 2: Fetch Transactions (user-scoped)
      addResult('Test 2', 'pending', 'Fetching transactions from user path...', null);
      const txRef = collection(firestore, 'users', user.uid, 'transactions');
      const txSnapshot = await getDocs(txRef);
      
      const transactions = txSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      addResult('Transactions Query (User Path)', 
        txSnapshot.size > 0 ? 'success' : 'error',
        `Found ${txSnapshot.size} transactions at users/${user.uid}/transactions`, 
        { 
          count: txSnapshot.size,
          path: `users/${user.uid}/transactions`,
          transactions: transactions.slice(0, 5) // First 5 only
        }
      );

      // Test 3: Check OLD ROOT LEVEL (before Firebase Auth migration)
      addResult('Test 3', 'pending', 'Checking old root-level transactions...', null);
      const rootTxRef = collection(firestore, 'transactions');
      const rootTxSnapshot = await getDocs(rootTxRef);
      
      addResult('Transactions Query (Root Level)', 
        rootTxSnapshot.size > 0 ? 'success' : 'error',
        `Found ${rootTxSnapshot.size} transactions at /transactions`, 
        { 
          count: rootTxSnapshot.size,
          path: '/transactions',
          note: 'This is the OLD location before user-scoped collections'
        }
      );

      // Test 4: Check Data Structure
      const allTransactions = [...transactions];
      if (allTransactions.length > 0) {
        const firstTx: any = allTransactions[0];
        const hasRequiredFields = firstTx.merchant && firstTx.amount && firstTx.date;
        
        addResult('Data Structure Check', 
          hasRequiredFields ? 'success' : 'error',
          hasRequiredFields ? 'All required fields present' : 'Missing required fields',
          { 
            firstTransaction: firstTx,
            fields: {
              merchant: !!firstTx.merchant,
              amount: !!firstTx.amount,
              date: !!firstTx.date,
              category: !!firstTx.category,
              type: !!firstTx.type
            }
          }
        );
      }

    } catch (error: any) {
      addResult('Error', 'error', error.message, {
        error: error,
        code: error.code,
        stack: error.stack
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testServerSideQuery = async () => {
    if (!user) {
      addResult('Auth Check', 'error', 'No user logged in', null);
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      addResult('Authentication', 'success', `User: ${user.uid}`, { uid: user.uid });

      // Test server-side function
      addResult('Test', 'pending', 'Calling server function to fetch transactions...', null);
      
      const response = await fetch('/api/test-firestore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });

      const result = await response.json();

      if (response.ok) {
        addResult('Server Query', 'success', 
          `Server found ${result.count} transactions`, 
          { 
            count: result.count,
            transactions: result.transactions?.slice(0, 5)
          }
        );
      } else {
        addResult('Server Query', 'error', result.error || 'Unknown error', result);
      }

    } catch (error: any) {
      addResult('Error', 'error', error.message, { error: error });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Firestore Data Test</CardTitle>
          <CardDescription>
            Direct test to verify if data exists in Firestore and can be retrieved
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <Alert>
              <AlertDescription>
                ⚠️ Please log in to run tests
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testClientSideQuery} disabled={isRunning}>
                  {isRunning ? 'Running...' : 'Test Client-Side Query'}
                </Button>
                <Button onClick={testServerSideQuery} disabled={isRunning} variant="secondary">
                  {isRunning ? 'Running...' : 'Test Server-Side Query'}
                </Button>
                <Button 
                  onClick={() => setTestResults([])} 
                  variant="ghost"
                  disabled={isRunning || testResults.length === 0}
                >
                  Clear
                </Button>
              </div>

              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Results:</h3>
                  {testResults.map((result, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge 
                          variant={
                            result.status === 'success' ? 'default' : 
                            result.status === 'error' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {result.status === 'success' ? '✅' : 
                           result.status === 'error' ? '❌' : 
                           '⏳'}
                        </Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold">{result.step}</h4>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                          {result.data && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer text-blue-600 hover:text-blue-800">
                                View Data
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-64">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expected Results</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Client-Side Test:</strong> Uses Firebase SDK directly from browser</p>
          <p><strong>Server-Side Test:</strong> Uses Admin SDK through API route</p>
          
          <Alert className="mt-4">
            <AlertDescription>
              <strong>If client-side works but server-side fails:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Check Firebase Admin credentials</li>
                <li>Verify network connectivity</li>
                <li>Check if index is required for server query</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
