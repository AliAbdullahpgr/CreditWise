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
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResendVerificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsSending(true);

    try {
      // We use password reset as a workaround since Firebase doesn't allow
      // sending verification emails without authentication
      // User should use the login page with their credentials
      toast({
        title: 'Alternative Approach',
        description: 'Please use your email and password on the login page. When you try to login with an unverified email, you can then resend the verification.',
      });
      
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Resend Verification Email</CardTitle>
        <CardDescription>
          Need to verify your email address?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <p className="text-sm">
              To resend your verification email, please go to the login page and enter your credentials.
              When login fails due to unverified email, you'll see the resend option.
            </p>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Don't forget to check your spam/junk folder for the verification email.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Go to Login Page
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/signup')}
            className="w-full"
          >
            Create New Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
