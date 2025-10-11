'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export default function TestDirectQueryPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const runDirectQuery = async () => {
    if (!user || !firestore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [DIRECT QUERY] Starting...');
      console.log('User ID:', user.uid);
      
      // Try 1: Direct collection reference
      const collRef = collection(firestore, 'users', user.uid, 'transactions');
      console.log('📍 Collection path:', collRef.path);
      
      const snapshot = await getDocs(collRef);
      console.log('📊 Snapshot size:', snapshot.size);
      console.log('📊 Snapshot empty:', snapshot.empty);
      
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ Documents found:', docs.length);
      docs.forEach((doc, i) => {
        console.log(`  ${i + 1}. ${doc.id}`, doc);
      });
      
      setResults(docs);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Direct Firestore Query Test</h1>
      
      <div className="mb-4">
        <p><strong>User ID:</strong> {user?.uid || 'Not logged in'}</p>
        <p><strong>Firestore:</strong> {firestore ? 'Connected' : 'Not connected'}</p>
      </div>

      <button
        onClick={runDirectQuery}
        disabled={!user || !firestore || loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {loading ? 'Querying...' : 'Run Direct Query'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <p className="font-bold">Error:</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Results: {results.length} documents</h2>
          <div className="space-y-2">
            {results.map((doc, i) => (
              <div key={i} className="p-4 bg-gray-100 rounded">
                <p className="font-mono text-sm"><strong>ID:</strong> {doc.id}</p>
                <pre className="text-xs mt-2">{JSON.stringify(doc, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p>No documents found. Click the button to query Firestore.</p>
        </div>
      )}
    </div>
  );
}
