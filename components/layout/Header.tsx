"use client";

import { Bell, HelpCircle, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Header() {
  return (
    <header className="border-b border-border bg-white px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search RFPs..."
            className="w-full bg-background pl-8"
          />
        </div>
        
        <div className="flex items-center ml-auto space-x-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-everstream-blue">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-everstream-blue">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-everstream-blue">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 ml-2">
            <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-everstream-blue text-white">JD</span>
            </span>
            <span className="hidden md:inline-flex">John Doe</span>
          </Button>
        </div>
      </div>
    </header>
  );
}