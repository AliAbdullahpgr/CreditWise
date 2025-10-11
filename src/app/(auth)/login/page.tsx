'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@/firebase';
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [showResendSection, setShowResendSection] = useState(false);
  const [lastUnverifiedUser, setLastUnverifiedUser] = useState<any>(null);

  useEffect(() => {
    // Only redirect if user is fully authenticated and verified
    if (!isUserLoading && user && user.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handlePostLogin = async (
    firebaseUser: import('firebase/auth').User
  ) => {
    try {
      await fetch('/api/create-user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }),
      });
    } catch (profileError) {
      // Don't block login if profile creation fails
    }

    toast({
      title: 'Login Successful',
      description: `Welcome back, ${firebaseUser.displayName || email}!`,
    });
    router.push('/dashboard');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoggingIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Store user info for resending verification email
        setLastUnverifiedUser(userCredential.user);
        setShowResendSection(true);
        
        // CRITICAL: Sign out immediately to prevent auto-redirect to dashboard
        await auth.signOut();
        
        toast({
          variant: 'destructive',
          title: 'Email Not Verified',
          description: 'Please verify your email before logging in. Use the "Resend Verification Email" button below.',
        });
        return;
      }
      
      await handlePostLogin(userCredential.user);
    } catch (error: any) {
      let description = 'An unexpected error occurred. Please try again.';
      
      if (error.code === 'auth/invalid-credential') {
        description = 'Invalid email or password.';
      } else if (error.code === 'auth/user-not-found') {
        description = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        description = 'Incorrect password.';
      } else if (error.code === 'auth/too-many-requests') {
        description = 'Too many failed login attempts. Please try again later.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResendVerification = async () => {
    if (!lastUnverifiedUser || !auth) {
      toast({
        variant: 'destructive',
        title: 'Cannot Resend',
        description: 'Please try logging in first with your email and password.',
      });
      return;
    }
    
    setIsResendingEmail(true);
    
    try {
      // Re-authenticate to get a fresh user object for sending verification
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      // Send the verification email
      await sendEmailVerification(userCredential.user, {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      });
      
      // Sign out after sending to keep security
      await auth.signOut();
      
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your email inbox (and spam folder) for the verification link.',
      });
    } catch (error: any) {
      let description = 'Could not send verification email. Please try again.';
      
      if (error.code === 'auth/too-many-requests') {
        description = 'Too many requests. Please wait a few minutes before trying again.';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        description = 'Invalid credentials. Please try logging in again.';
        setShowResendSection(false);
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description,
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent flash of login page if user is already logged in and verified
  if (user && user.emailVerified) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoggingIn}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoggingIn}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
        
        {showResendSection && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Email not verified
                </span>
              </div>
            </div>

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <p className="text-sm">
                  Your email hasn't been verified yet. Please check your inbox (and spam folder) for the verification link.
                </p>
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  size="sm"
                  disabled={isResendingEmail}
                  className="w-full"
                >
                  {isResendingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resend Verification Email
                </Button>
              </AlertDescription>
            </Alert>
          </>
        )}
        
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}