'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { generateDisplayName } from '@/lib/username-generator';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;
        
        // Create user profile in Firestore
        setDocumentNonBlocking(doc(firestore, "users", user.uid), {
            email: user.email,
            displayName: generateDisplayName(),
            firstName: '',
            lastName: '',
            address: '',
            createdAt: serverTimestamp()
        }, { merge: true });

        toast({ title: 'Account created successfully!' });
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({ title: 'Signed in successfully!' });
      }
    } catch (error: any) {
      console.error('Authentication error:', error.code, error.message);

      let title = 'Authentication Failed';
      let description = 'An unexpected error occurred. Please try again.';

      if (mode === 'login') {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            title = 'Invalid Credentials';
            description = 'The email or password you entered is incorrect. Please check and try again.';
            break;
          case 'auth/too-many-requests':
            title = 'Too Many Attempts';
            description = 'Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.';
            break;
          default:
            // Keep generic error for other cases
            break;
        }
      } else { // signup mode
        switch (error.code) {
          case 'auth/email-already-in-use':
            title = 'Account Exists';
            description = 'An account with this email address already exists. Please try logging in.';
            break;
          case 'auth/weak-password':
            title = 'Weak Password';
            description = 'The password is too weak. Please use a stronger password.';
            break;
          default:
            // Keep generic error for other cases
            break;
        }
      }

      toast({
        variant: 'destructive',
        title: title,
        description: description,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className={cn("w-full", mode === 'signup' && "bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent")} 
            disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In'
              : 'Sign Up'}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
