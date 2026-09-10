'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { BrandProvider, useBrand } from '@/context/BrandProvider';
import BrandLogo from '@/components/BrandLogo';

function LoginForm() {
  const brand = useBrand();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    await signIn('cognito', { callbackUrl: '/' });
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      setMessage(data.error || 'Signup failed.');
      setLoading(false);
      return;
    }

    setShowConfirm(true);
    setMessage('Account created. Enter the verification code sent to your email.');
    setLoading(false);
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/auth/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      setMessage(data.error || 'Confirmation failed.');
      setLoading(false);
      return;
    }

    setMessage('Account confirmed. Continue to sign in.');
    setLoading(false);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: brand.colors.background }}
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex justify-center">
          <BrandLogo
            src={brand.logos.header}
            alt={brand.name}
            fallbackText={brand.name}
            width={188}
            height={56}
            priority
          />
        </div>
        <h1 className="mb-4 text-xl font-semibold text-gray-900">
          {brand.name}
        </h1>
        <p className="mb-4 text-sm text-gray-600">Secure login</p>

        <button
          type="button"
          onClick={handleSignIn}
          className="mb-6 w-full rounded px-4 py-2 text-white"
          style={{ backgroundColor: brand.colors.primary }}
        >
          Sign in with Cognito
        </button>

        <div className="mb-3 text-sm font-medium text-gray-700">New user?</div>
        <form className="space-y-3" onSubmit={showConfirm ? handleConfirm : handleSignup}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />

          {!showConfirm ? (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          ) : (
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Verification code"
              required
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded px-4 py-2 text-white disabled:opacity-60"
            style={{ backgroundColor: brand.colors.primaryDark }}
          >
            {loading
              ? 'Please wait...'
              : showConfirm
                ? 'Confirm account'
                : 'Create account'}
          </button>
        </form>

        {message ? <p className="mt-3 text-sm text-gray-700">{message}</p> : null}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <BrandProvider>
      <LoginForm />
    </BrandProvider>
  );
}
