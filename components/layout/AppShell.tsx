'use client';
import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  activeRoute?: string;
}

export default function AppShell({ children, activeRoute }: AppShellProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeRoute={activeRoute} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}