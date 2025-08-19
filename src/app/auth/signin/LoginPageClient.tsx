'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';
import { CircleDashed, Eye, EyeOff } from 'lucide-react';
import {
  useGoogleReCaptcha,
  GoogleReCaptchaProvider,
} from 'react-google-recaptcha-v3';
import { getStaffByEmail } from '@/components/dashboard/staff/services/staffCrud';

// This is the inner component that uses the reCAPTCHA hook.
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [_captchaToken, setCaptchaToken] = useState('');
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [code, setCode] = useState('');
  const [redirectPath, setRedirectPath] = useState('/dashboard');

  // Load brand logo and get redirect parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get redirect from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');

      if (redirect) {
        setRedirectPath(redirect);
      }
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      console.error('Execute recaptcha not yet available');

      return;
    }

    // Get the token and then update state
    const token = await executeRecaptcha('login');

    setCaptchaToken(token);

    startTransition(async () => {
      const staff = await getStaffByEmail(email);

      if (staff && staff.twoFactorEnabled && !code) {
        setStep('2fa');

        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        captcha: token,
        twoFaCode: code,
      });

      if (result?.error) {
        console.error('Error signing in:', result.error);
        setError(result.error);
      } else {
        toast({
          title: 'Success',
          description: 'You have successfully logged in',
          variant: 'default',
        });
        router.push(redirectPath);
      }
    });
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-secondary to-accent px-4 md:px-0'>
      {step === 'credentials' ? (
        <div className='max-w-md w-full p-8 bg-white rounded-2xl shadow-lg'>
          <div className='flex flex-col items-center mb-6'>
            <Image
              src={'/logo.png'}
              height={60}
              width={60}
              alt='LML Logo'
              className='rounded-md'
            />
            <h1 className='text-2xl font-bold mt-4 mb-2 text-gray-800 rounded-full'>
              Sign In
            </h1>
          </div>
          {error && (
            <p className='text-red-500 text-center text-sm mb-4'>{error}</p>
          )}
          <form onSubmit={onSubmit} className='space-y-4'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                Email
              </label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                required
                className='w-full'
              />
            </div>
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
                Password
              </label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Enter your password'
                  required
                  className='w-full pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5 text-gray-400' />
                  ) : (
                    <Eye className='h-5 w-5 text-gray-400' />
                  )}
                </button>
              </div>
            </div>
            <Button
              type='submit'
              disabled={isPending}
              className='w-full bg-primary hover:bg-primary/90 text-white'
            >
              {isPending ? (
                <>
                  <CircleDashed className='mr-2 h-4 w-4 animate-spin' />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      ) : (
        <div className='max-w-md w-full p-8 bg-white rounded-2xl shadow-lg'>
          <div className='flex flex-col items-center mb-6'>
            <Image
              src={'/logo.png'}
              height={60}
              width={60}
              alt='LML Logo'
              className='rounded-md'
            />
            <h1 className='text-2xl font-bold mt-4 mb-2 text-gray-800'>
              Two-Factor Authentication
            </h1>
            <p className='text-gray-600 text-center'>
              Please enter the 6-digit code from your authenticator app
            </p>
          </div>
          {error && (
            <p className='text-red-500 text-center text-sm mb-4'>{error}</p>
          )}
          <form onSubmit={onSubmit} className='space-y-4'>
            <div>
              <label htmlFor='code' className='block text-sm font-medium text-gray-700 mb-1'>
                Authentication Code
              </label>
              <Input
                id='code'
                type='text'
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder='Enter 6-digit code'
                required
                className='w-full'
                maxLength={6}
              />
            </div>
            <Button
              type='submit'
              disabled={isPending}
              className='w-full bg-primary hover:bg-primary/90 text-white'
            >
              {isPending ? (
                <>
                  <CircleDashed className='mr-2 h-4 w-4 animate-spin' />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
            <Button
              type='button'
              onClick={() => setStep('credentials')}
              variant='outline'
              className='w-full'
            >
              Back to Sign In
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

// This is the wrapper component that provides the reCAPTCHA context.
const LoginPageClient = () => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      <LoginForm />
    </GoogleReCaptchaProvider>
  );
};

export default LoginPageClient;
