'use client';

import { Button } from '@/components/ui/button';
import { signIn, signOut } from 'next-auth/react';
import { logout } from './service/logout';

export const LoginButton = () => {
  return (
    <Button
      variant={'ghost'}
      className="hover:bg-transparent font-light text-white p-0 m-0 hover:text-white hover:underline hover:underline-offset-1"
      onClick={() => signIn(undefined, { callbackUrl: '/dashboard' })}
    >
      Portal
    </Button>
  );
};

export const LogoutButton = () => {
  const handleSignOut = async () => {
    await logout();
    signOut({ callbackUrl: '/', redirect: true });
  };

  return (
    <Button variant={'destructive'} onClick={handleSignOut}>
      Sign Out
    </Button>
  );
};
