"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Home, 
  Archive, 
  Settings, 
  BarChart, 
  ChevronLeft, 
  ChevronRight,
  FileUp,
  Shield,
  List
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSupabaseUser } from '@/lib/useSupabaseUser';

interface SidebarProps {
  activeRoute?: string;
}

export default function Sidebar({ activeRoute }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, loading: userLoading } = useSupabaseUser();

  const navigation = [
    { icon: <Home className="h-5 w-5" />, label: 'Dashboard (coming soon)', href: '/dashboard' },
    { icon: <List className="h-5 w-5" />, label: 'All RFPs', href: '/rfps/all' },
    { icon: <Archive className="h-5 w-5" />, label: 'Archive', href: '/archive' }
  ];

  const adminNavigation = user && user.app_metadata.app_role === 'admin' ? [
    { icon: <Shield className="h-5 w-5" />, label: 'Admin Console', href: '/admin/users' }
  ] : [];

  const allNavigation = [...navigation, ...adminNavigation];

  return (
    <aside 
      className={cn(
        "bg-white border-r border-border h-screen transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
          {!collapsed ? (
            <Image
              src="https://www.everstream.ai/wp-content/themes/everstreamai2025/src/assets/everstream-color-logo.svg"
              alt="Everstream Analytics"
              width={147}
              height={34}
              priority
            />
          ) : (
            <Image
              src="https://www.everstream.ai/wp-content/themes/everstreamai2025/src/assets/everstream-color-logo.svg"
              alt="Everstream Analytics"
              width={32}
              height={32}
              priority
              className="object-contain"
            />
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0 text-everstream-gray hover:text-everstream-blue"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="p-3">
        <Link href="/upload">
          <Button 
            className={cn(
              "w-full justify-start font-medium gap-2 bg-everstream-orange hover:bg-everstream-orange/90 text-white",
              collapsed && "justify-center px-0"
            )}
          >
            <FileUp className="h-5 w-5" />
            {!collapsed && <span>Upload RFP</span>}
          </Button>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {allNavigation.map((item) => {
            const isActive = 
              (item.href === pathname) || 
              (activeRoute === item.label.toLowerCase()) ||
              (item.label === 'Dashboard (coming soon)' && pathname === '/dashboard') ||
              (item.label === 'All RFPs' && pathname.startsWith('/rfps'));
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start font-medium gap-2",
                      collapsed && "justify-center px-0",
                      isActive && "bg-everstream-blue/10 text-everstream-blue hover:bg-everstream-blue/20"
                    )}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-3 mt-auto border-t border-border">
        {/* Original Settings button in sidebar body is removed as it's now in header */}
        {/* <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start font-medium gap-2 text-everstream-gray hover:text-everstream-blue",
            collapsed && "justify-center px-0"
          )}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>Settings</span>}
        </Button> */}
      </div>
    </aside>
  );
}