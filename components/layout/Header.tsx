"use client";

import { Bell, HelpCircle, Search, Settings, LogOut, User } from 'lucide-react';
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

  const handleLoginRedirect = () => {
    router.push('/auth/login');
  };

  const navigateToAdminConsole = () => {
    router.push('/admin/users');
  };

  const navigateToProfile = () => {
    router.push('/profile');
  };

  let userInitials = 'U';

  if (!loading && user) {
    if (user.profile && user.profile.first_name && user.profile.last_name) {
      userInitials = `${user.profile.first_name.charAt(0)}${user.profile.last_name.charAt(0)}`.toUpperCase();
    } else if (user.profile && user.profile.first_name) {
      userInitials = user.profile.first_name.substring(0, 2).toUpperCase();
    } else if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      userInitials = emailPrefix.substring(0, 2).toUpperCase();
    } else {
      userInitials = 'U';
    }
    if (userInitials.length === 0) userInitials = 'U';
    if (userInitials.length > 2) userInitials = userInitials.substring(0,2);
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-everstream-blue">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user && user.app_metadata.app_role === 'admin' && (
                <DropdownMenuItem onClick={navigateToAdminConsole}>
                  Admin Console
                </DropdownMenuItem>
              )}
               {/* Add other settings items here */}
            </DropdownMenuContent>
          </DropdownMenu>

          {loading ? (
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse ml-2"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-everstream-blue text-white">{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.profile?.first_name && user.profile?.last_name ? `${user.profile.first_name} ${user.profile.last_name}` : (user.email || 'My Account')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={navigateToProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Settings (coming soon)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={handleLoginRedirect} className="ml-2">
              Log In
            </Button>
          )}

        </div>
      </div>
    </header>
  );
}