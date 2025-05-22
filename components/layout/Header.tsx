"use client";

import { Bell, HelpCircle, Search, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  let userInitials = 'U';
  let userDisplayName = 'User';

  if (!loading && user) {
    userDisplayName = user.email || 'User';
    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      userInitials = emailPrefix.substring(0, 2).toUpperCase();
    } else {
      userInitials = (userDisplayName.substring(0,1) + (userDisplayName.split(' ')[1]?.substring(0,1) || '')).toUpperCase();
       if(userInitials.length === 0) userInitials = 'U';
    }
  }
  
  if (loading) {
    // Optional: render a loading state for the user section of the header
    // For now, it will just show default initials/name until loading is false
  }

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 ml-2">
                 <Avatar className="h-8 w-8">
                    {/* <AvatarImage src={user?.user_metadata?.avatar_url} /> */}
                    <AvatarFallback className="bg-everstream-blue text-white">{userInitials}</AvatarFallback>
                  </Avatar>
                <span className="hidden md:inline-flex">{userDisplayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Profile (coming soon)</DropdownMenuItem>
              <DropdownMenuItem disabled>Settings (coming soon)</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}