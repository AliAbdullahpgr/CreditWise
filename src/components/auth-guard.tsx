'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      // If no user, redirect to login
      if (!user) {
        router.push('/login');
        return;
      }

      // If user exists but email is not verified, redirect to login
      if (!user.emailVerified) {
        router.push('/login');
        return;
      }
    }
  }, [user, isUserLoading, router]);

  // Show loading state while checking authentication
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Show loading while redirecting unauthenticated users
  if (!user || !user.emailVerified) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  // User is authenticated and verified, show the protected content
  return <>{children}</>;
}
