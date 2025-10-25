'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser, useAuth } from '@/firebase';
import { Loader2, Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // If user is already verified, redirect to dashboard
    if (!isUserLoading && user?.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  // Auto-check verification status every 3 seconds if user is logged in
  useEffect(() => {
    if (!user || user.emailVerified) return;

    const interval = setInterval(async () => {
      try {
        await user.reload();
        // If verified, the useEffect above will redirect
      } catch (error) {
        // Ignore errors during auto-check
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  const handleCheckVerification = async () => {
    if (!auth?.currentUser) {
      toast({
        title: 'Please Login',
        description: 'Please log in with your email and password to check verification status.',
      });
      router.push('/login');
      return;
    }

    setIsChecking(true);

    try {
      // Reload user to get latest emailVerified status from Firebase
      await auth.currentUser.reload();
      
      const updatedUser = auth.currentUser;
      
      if (updatedUser.emailVerified) {
        toast({
          title: 'Email Verified! 🎉',
          description: 'Your email has been verified. Redirecting to dashboard...',
        });
        // The useEffect will handle the redirect
      } else {
        toast({
          variant: 'destructive',
          title: 'Not Verified Yet',
          description: 'Please click the verification link in your email first.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to check verification status. Please try again.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleBackToLogin = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/login');
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // If user is verified, show success message while redirecting
  if (user?.emailVerified) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-headline">Email Verified!</CardTitle>
            <CardDescription>
              Redirecting you to the dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-headline">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification email to your inbox
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              {user ? (
                <>
                  <p className="mb-2">Please check your email inbox (and spam folder) for a verification link.</p>
                  <p className="text-xs text-muted-foreground">
                    We're automatically checking your verification status...
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-2">Please check your email inbox (and spam folder) for a verification link.</p>
                  <p className="text-xs text-muted-foreground">
                    After clicking the link, please log in to continue.
                  </p>
                </>
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {user && (
              <Button
                onClick={handleCheckVerification}
                disabled={isChecking}
                className="w-full"
              >
                {isChecking ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</>
                ) : (
                  <><RefreshCw className="mr-2 h-4 w-4" /> Check Verification Status</>
                )}
              </Button>
            )}
            
            <Button
              onClick={handleBackToLogin}
              variant={user ? "ghost" : "default"}
              className="w-full"
            >
              {user ? 'Sign Out & Go to Login' : 'Go to Login'}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Don't have an account?{' '}
              <Link href="/signup" className="underline hover:text-primary">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
