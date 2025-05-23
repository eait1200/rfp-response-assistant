'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email || !password) {
      setError('Both fields are required.');
      return;
    }
    setLoading(true);
    const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    } else if (signInData.user) {
      setSuccess('Login successful! You will be redirected shortly.');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-everstream-blue to-everstream-blue/70 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="flex justify-center mb-8">
          <Image
            src="https://www.everstream.ai/wp-content/themes/everstreamai2025/src/assets/everstream-color-logo.svg"
            alt="RFP Tool Logo"
            width={180} 
            height={45}
            priority
          />
        </div>
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">Sign in to RFP tool</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password"  className="text-sm font-medium text-gray-700">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-1"
            />
          </div>
          {error && <div className="text-red-600 text-sm text-center py-2">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center py-2">{success}</div>}
          <Button 
            type="submit" 
            className="w-full bg-everstream-blue hover:bg-everstream-blue/90 text-white py-2.5 text-sm font-medium" 
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-everstream-blue hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </div>
      <footer className="mt-8 text-center text-sm text-white/80">
        © {new Date().getFullYear()} RFP Tool. All rights reserved.
      </footer>
    </div>
  );
} 