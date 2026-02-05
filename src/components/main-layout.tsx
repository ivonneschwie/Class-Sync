'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { Calendar, Bot, LayoutGrid, BookOpen, Layers, LogOut, Loader2, User as UserIcon, Settings, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useProfile } from '@/context/profile-context';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';


const navItems = [
  {
    href: '/',
    icon: Calendar,
    label: 'Schedule',
  },
  {
    href: '/timetable',
    icon: LayoutGrid,
    label: 'Time Table',
  },
  {
    href: '/summarizer',
    icon: Bot,
    label: 'AI Summarizer',
  },
  {
    href: '/lesson-catalog',
    icon: BookOpen,
    label: 'Lesson Catalog',
  },
  {
    href: '/flashcards',
    icon: Layers,
    label: 'Flashcards',
  },
  {
    href: '/profile',
    icon: UserIcon,
    label: 'Profile',
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Settings',
  },
];

const accountNavItems = [
    { href: '/profile', icon: UserIcon, label: 'Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!isUserLoading && !user && !isAuthPage) {
      router.push('/login');
    }
  }, [isUserLoading, user, isAuthPage, router]);

  if (isUserLoading || (!user && !isAuthPage)) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
        <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader>
                 <SidebarMenuButton asChild className="h-auto">
                    <Link href="/" className="flex items-center gap-2 font-headline font-semibold text-lg p-2">
                        <Logo className="h-6 w-6 text-primary" />
                        <span className="group-data-[collapsible=icon]:hidden">ClassSync</span>
                    </Link>
                 </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navItems.map((item) => (
                        !['/profile', '/settings'].includes(item.href) && (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                                    <Link href={item.href}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <AccountDropdown />
            </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-muted/20">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
                <SidebarTrigger />
                <h1 className="font-headline text-lg font-semibold">
                    {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
                </h1>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}


function AccountDropdown() {
  const auth = useAuth();
  const { user } = useUser();
  const { profile, isLoading } = useProfile();
  const { state: sidebarState } = useSidebar();
  const router = useRouter();

  if (isLoading) {
    return (
        <div className="flex items-center gap-2 p-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="group-data-[collapsible=icon]:hidden">Loading...</span>
        </div>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const dropdownContent = (
    <DropdownMenuContent className="mb-2 w-56" side="top" align="end">
        <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accountNavItems.map(item => (
            <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
                <item.icon />
                <span>{item.label}</span>
            </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => auth.signOut()}>
            <LogOut />
            <span>Sign Out</span>
        </DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (sidebarState === 'collapsed') {
      return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="w-full justify-center p-2 h-auto">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback>{profile?.displayName ? getInitials(profile.displayName) : '??'}</AvatarFallback>
                    </Avatar>
                 </Button>
            </DropdownMenuTrigger>
            {dropdownContent}
        </DropdownMenu>
      )
  }

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-auto p-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback>{profile?.displayName ? getInitials(profile.displayName) : '??'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start overflow-hidden">
                        <span className="truncate font-medium">{profile?.displayName || "My Account"}</span>
                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
        </DropdownMenuTrigger>
        {dropdownContent}
    </DropdownMenu>
  );
}
