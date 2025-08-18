import { Metadata } from 'next';

import LoginPageClient from './LoginPageClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Sign In | Phone & Electronics Repair Services',
    description: 'Access your repair services account to track repairs, manage appointments, and view repair history. Secure login with two-factor authentication for your protection.',
    keywords: 'phone repair login, electronics repair account, repair tracking, repair history, secure login, two-factor authentication, repair services portal',
  };
}

export default function SignInPage() {
  const signInStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Sign In to LML Repair',
    description: 'Secure login portal for LML Repair customers',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.lmlrepair.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Sign In',
          item: 'https://www.lmlrepair.com/auth/signin',
        },
      ],
    },
  };

  const loginActionStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'LoginAction',
    name: 'Sign In to LML Repair',
    description: 'Secure login portal for accessing repair services and account management',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.lmlrepair.com/auth/signin',
      actionPlatform: [
        'http://schema.org/DesktopWebPlatform',
        'http://schema.org/MobileWebPlatform',
      ],
    },
  };

  return (
    <>
      <LoginPageClient />
    </>
  );
}
