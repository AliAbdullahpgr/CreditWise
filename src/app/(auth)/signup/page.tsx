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
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect verified users to dashboard
    // Unverified users will be redirected to verify-email by AuthGuard
    if (!isUserLoading && user && user.emailVerified && !isSigningUp && !isRedirecting) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, isSigningUp, isRedirecting, router]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsSigningUp(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const displayName = `${firstName} ${lastName}`.trim();
      await updateProfile(user, { displayName });

      // Send email verification with custom settings
      try {
        await sendEmailVerification(user, {
          url: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/login`,
          handleCodeInApp: false,
        });
      } catch (emailError: any) {
        console.error('Email verification error:', emailError);
        toast({
          variant: 'destructive',
          title: 'Warning',
          description: 'Account created but verification email could not be sent. You can try logging in and we will send you a verification email.',
        });
      }

      // Create user profile in Firestore
      try {
        await fetch('/api/create-user-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            email: user.email,
            displayName,
            photoURL: user.photoURL,
          }),
        });
      } catch (profileError) {
        // Silently fail - profile creation is not critical for signup
      }

      // Set redirecting flag to prevent auto-redirect to dashboard
      setIsRedirecting(true);
      
      // DON'T sign out - keep user authenticated so they can check verification status
      // await auth.signOut();

      toast({
        title: 'Account Created! 🎉',
        description: 'Please check your email to verify your account. We\'ll check your status automatically.',
      });
      
      // Redirect to verify-email page (user stays authenticated)
      router.push('/verify-email');
    } catch (error: any) {
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        description =
          'This email is already in use. Please try logging in instead.';
      } else if (error.code === 'auth/weak-password') {
        description = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        description = 'Invalid email address.';
      }
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description,
      });
    } finally {
      setIsSigningUp(false);
      // Keep redirecting flag true if we successfully signed up
      // It will be reset when component unmounts
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSignup} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                placeholder="Max"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSigningUp}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                placeholder="Robinson"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSigningUp}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSigningUp}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSigningUp}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSigningUp}>
            {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create an account
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

    