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
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
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

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handlePostSignup = async (
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
      console.error('Error creating user profile:', profileError);
      // Don't block signup if profile creation fails
    }

    toast({
      title: 'Account Created!',
      description: `Welcome, ${firebaseUser.displayName}!`,
    });
    router.push('/dashboard');
  };

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

      // We need to reload the user to get the updated displayName
      await user.reload();
      const updatedUser = auth.currentUser;

      if (updatedUser) {
        await handlePostSignup(updatedUser);
      }
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        description =
          'This email is already in use. Please try logging in instead.';
      } else if (error.code === 'auth/weak-password') {
        description = 'Password should be at least 6 characters.';
      }
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description,
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!auth) return;
    setIsSigningUp(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await handlePostSignup(result.user);
    } catch (error) {
      console.error('Error signing up with Google:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: 'Could not sign up with Google. Please try again.',
      });
    } finally {
      setIsSigningUp(false);
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
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={isSigningUp}
            type="button"
          >
            {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign up with Google
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

    