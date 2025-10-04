'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FirestoreTestPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runFirestoreTest = async () => {
    setLoading(true);
    setTestResults(null);
    
    try {
      console.log('🧪 [CLIENT] Starting Firestore connection test...');
      
      const response = await fetch('/api/test-firestore');
      const data = await response.json();
      
      console.log('📊 [CLIENT] Test results:', data);
      setTestResults(data);
      
    } catch (error) {
      console.error('❌ [CLIENT] Test failed:', error);
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        errorAnalysis: 'Failed to reach API endpoint',
        solution: 'Check if dev server is running on port 9003'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">🔥 Firestore Connection Test</h1>
          <p className="text-gray-600 mt-2">
            Test your Firebase Firestore configuration and connection
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Firestore Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              This will test all Firestore operations your app needs:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Basic read/write operations</li>
              <li>✅ Documents collection creation</li>
              <li>✅ Transactions collection creation</li>
              <li>✅ Query operations (userId filtering)</li>
              <li>✅ Data cleanup</li>
            </ul>
            
            <Button 
              onClick={runFirestoreTest} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '🔄 Running Tests...' : '🧪 Run Firestore Tests'}
            </Button>
          </CardContent>
        </Card>

        {testResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {testResults.success ? '✅ Test Results - SUCCESS' : '❌ Test Results - FAILED'}
                <Badge variant={testResults.success ? 'default' : 'destructive'}>
                  {testResults.success ? 'PASS' : 'FAIL'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {testResults.success ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">🎉 All Tests Passed!</h3>
                    <p className="text-green-700 text-sm">
                      Your Firestore is configured correctly and ready to use.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Test Results:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(testResults.tests || {}).map(([test, result]) => (
                        <div key={test} className="flex justify-between">
                          <span className="capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span>{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-semibold text-blue-800 mb-1">✅ Ready to Upload Documents!</h4>
                    <p className="text-blue-700 text-sm">
                      Go to the <a href="/documents" className="underline font-medium">Documents page</a> and upload a receipt or bill to test the full AI workflow.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">❌ Firestore Connection Failed</h3>
                    <p className="text-red-700 text-sm mb-2">
                      <strong>Error:</strong> {testResults.error}
                    </p>
                    <p className="text-red-700 text-sm mb-2">
                      <strong>Analysis:</strong> {testResults.errorAnalysis}
                    </p>
                    <p className="text-red-700 text-sm">
                      <strong>Solution:</strong> {testResults.solution}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Environment Check:</h4>
                <div className="text-sm space-y-1 font-mono bg-gray-50 p-3 rounded">
                  <div>Project ID: <span className="font-bold">{testResults.environment?.projectId || 'NOT SET'}</span></div>
                  <div>Has Credentials: <span className="font-bold">{testResults.environment?.hasCredentials ? '✅ YES' : '❌ NO'}</span></div>
                  <div>Timestamp: <span className="text-gray-600">{testResults.timestamp}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>🔧 Quick Fixes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold">If test fails with "Permission denied":</h4>
              <p className="text-gray-600">
                Go to <a href="https://console.firebase.google.com/project/hisaabscore/firestore/rules" target="_blank" className="text-blue-600 underline">
                  Firestore Rules
                </a> and set: <code className="bg-gray-100 px-1">allow read, write: if true;</code>
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">If test fails with "Project not found":</h4>
              <p className="text-gray-600">
                Check your <code className="bg-gray-100 px-1">.env.local</code> file and verify Firebase project ID
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">If test fails with "Authentication failed":</h4>
              <p className="text-gray-600">
                Verify your Firebase service account credentials in <code className="bg-gray-100 px-1">.env.local</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}