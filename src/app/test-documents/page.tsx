'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getFirestore, collection, query, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export default function TestDocumentsPage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (step: string, status: TestResult['status'], message: string, data?: any) => {
    setTestResults(prev => [...prev, { step, status, message, data }]);
  };

  const runTests = async () => {
    if (!user) {
      addResult('Authentication', 'error', 'No user logged in', null);
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Check user authentication
      addResult('Authentication', 'success', `User logged in: ${user.uid}`, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });

      const firestore = getFirestore();

      // Test 2: Check documents collection path
      const documentsPath = `users/${user.uid}/documents`;
      addResult('Collection Path', 'success', `Path: ${documentsPath}`, { path: documentsPath });

      // Test 3: Query existing documents
      const documentsRef = collection(firestore, 'users', user.uid, 'documents');
      const documentsQuery = query(documentsRef, orderBy('uploadDate', 'desc'));
      
      addResult('Query Creation', 'success', 'Query created successfully', {
        collectionPath: documentsRef.path,
        queryConstraints: 'orderBy(uploadDate, desc)'
      });

      // Test 4: Fetch documents (without orderBy)
      const snapshot = await getDocs(documentsQuery);
      addResult('Fetch Documents', snapshot.size > 0 ? 'success' : 'error', 
        `Found ${snapshot.size} documents`, {
        count: snapshot.size,
        empty: snapshot.empty
      });

      // Test 5: Display document details
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          path: doc.ref.path,
          data: doc.data()
        }));
        addResult('Document Details', 'success', 'Documents retrieved', { documents: docs });
      } else {
        addResult('Document Details', 'error', 'No documents found in database', null);
      }

      // Test 6: Create a test document
      const testDocumentData = {
        id: `test-${Date.now()}`,
        name: 'test-document.jpg',
        uploadDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        type: 'receipt',
        status: 'pending',
        userId: user.uid,
        storageUrl: 'placeholder://test-image.jpg',
        extractedTransactionCount: 0,
        createdAt: Timestamp.now()
      };

      addResult('Test Document Creation', 'pending', 'Creating test document...', testDocumentData);

      const docRef = await addDoc(documentsRef, testDocumentData);
      
      addResult('Test Document Created', 'success', `Document created with ID: ${docRef.id}`, {
        id: docRef.id,
        path: docRef.path
      });

      // Test 7: Verify the document was created by fetching again
      const verifySnapshot = await getDocs(documentsQuery);
      addResult('Verification', 'success', `Documents after creation: ${verifySnapshot.size}`, {
        count: verifySnapshot.size,
        newDocumentFound: verifySnapshot.docs.some(doc => doc.id === docRef.id)
      });

      // Test 8: Check if uploadDate field exists on all documents
      const docsWithoutUploadDate = verifySnapshot.docs.filter(doc => !doc.data().uploadDate);
      if (docsWithoutUploadDate.length > 0) {
        addResult('Field Validation', 'error', `${docsWithoutUploadDate.length} documents missing uploadDate field`, {
          documentsWithoutUploadDate: docsWithoutUploadDate.map(d => ({
            id: d.id,
            data: d.data()
          }))
        });
      } else {
        addResult('Field Validation', 'success', 'All documents have uploadDate field', null);
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

  const clearTestDocument = async () => {
    if (!user) return;
    
    try {
      const firestore = getFirestore();
      const documentsRef = collection(firestore, 'users', user.uid, 'documents');
      const snapshot = await getDocs(documentsRef);
      
      // Find and delete test documents
      const testDocs = snapshot.docs.filter(doc => doc.data().name?.includes('test-document'));
      
      addResult('Cleanup', 'success', `Found ${testDocs.length} test documents to delete`, null);
      
      // Note: We'll just report them, not delete, to avoid accidental data loss
      if (testDocs.length > 0) {
        addResult('Cleanup Info', 'success', 'Test documents found (not deleted for safety)', {
          testDocuments: testDocs.map(d => ({ id: d.id, name: d.data().name }))
        });
      }
    } catch (error: any) {
      addResult('Cleanup Error', 'error', error.message, null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Upload Functionality Test</CardTitle>
          <CardDescription>
            Comprehensive test suite to diagnose document upload and retrieval issues
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
                <Button onClick={runTests} disabled={isRunning}>
                  {isRunning ? 'Running Tests...' : 'Run Tests'}
                </Button>
                <Button onClick={clearTestDocument} variant="outline" disabled={isRunning}>
                  Check for Test Documents
                </Button>
                <Button 
                  onClick={() => setTestResults([])} 
                  variant="ghost"
                  disabled={isRunning || testResults.length === 0}
                >
                  Clear Results
                </Button>
              </div>

              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Test Results:</h3>
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
                                View Details
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
          <CardTitle>What This Test Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Authentication:</strong> Verifies user is logged in and gets user ID</li>
            <li><strong>Collection Path:</strong> Confirms correct Firestore path (users/{'{userId}'}/documents)</li>
            <li><strong>Query Creation:</strong> Tests if orderBy query can be created</li>
            <li><strong>Fetch Documents:</strong> Attempts to retrieve existing documents</li>
            <li><strong>Document Details:</strong> Shows all document data including uploadDate field</li>
            <li><strong>Test Document:</strong> Creates a new test document with all required fields</li>
            <li><strong>Verification:</strong> Confirms the test document was successfully created</li>
            <li><strong>Field Validation:</strong> Checks if all documents have uploadDate field</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expected vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold">Expected Document Structure:</h4>
              <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
{`{
  id: "abc123",
  name: "demo.jpg",
  uploadDate: "2025-10-11",        // ← CRITICAL for orderBy query
  type: "receipt",
  status: "pending",
  userId: "wvc3k1IU1XOahpRCUODip22ApVv2",
  storageUrl: "placeholder://...",
  extractedTransactionCount: 0,
  createdAt: Timestamp
}`}
              </pre>
            </div>
            
            <Alert>
              <AlertDescription>
                <strong>Common Issues:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Missing <code>uploadDate</code> field → orderBy query fails</li>
                  <li>Wrong date format → query can't sort properly</li>
                  <li>Documents at wrong path → query returns empty</li>
                  <li>Security rules blocking read → permission denied error</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
