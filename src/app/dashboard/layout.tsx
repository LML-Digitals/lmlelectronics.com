import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { SideBar } from '@/components/dashboard/sidebar/Sidebar';
import Header from '@/components/common/header/Header';
import PageWrapper from '@/components/common/page-wrapper/PageWrapper';
import ThemeProvider from '@/components/common/ThemeProvider';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import '@/app/globals.css';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Dashboard layout component
export default function DashboardLayout ({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Sidebar - handles its own responsive behavior */}
          <SideBar />

          {/* Main content area - responsive width */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-muted/30">
              <div className="h-full p-4 md:p-6 lg:p-8">
                <PageWrapper>{children}</PageWrapper>
              </div>
            </main>
          </div>
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
