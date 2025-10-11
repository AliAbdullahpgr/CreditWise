'use client';

import { useEffect } from 'react';
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
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    // If user is already verified, redirect to dashboard
    if (!isUserLoading && user?.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

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
              Please check your email inbox (and spam folder) for a verification link. 
              Click the link to verify your email address.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              onClick={handleBackToLogin}
              variant="ghost"
              className="w-full"
            >
              Back to Login
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
