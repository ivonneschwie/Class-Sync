'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { Calendar, Bot, Menu, LayoutGrid, BookOpen, Layers, LogOut, Loader2, User as UserIcon, Settings, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
    <div className="min-h-screen w-full">
      <DesktopSidebar pathname={pathname} />
      <div className="flex flex-col md:pl-[220px] lg:pl-[280px]">
        <MobileHeader pathname={pathname} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

function DesktopSidebar({ pathname }: { pathname: string }) {
    const visibleNavItems = navItems.filter(item => !['/profile', '/settings'].includes(item.href));

    return (
        <aside className="hidden border-r bg-card md:block fixed top-0 left-0 z-20 h-screen w-[220px] lg:w-[280px]">
        <div className="flex h-full flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-headline font-semibold text-lg">
                <Logo className="h-6 w-6 text-primary" />
                <span>ClassSync</span>
            </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {visibleNavItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === item.href && "bg-muted text-primary"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Link>
                ))}
            </nav>
            </div>
            <div className="mt-auto p-4">
                <AccountDropdown />
            </div>
        </div>
        </aside>
    );
}

function MobileHeader({ pathname }: { pathname: string }) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const visibleNavItems = navItems.filter(item => !['/profile', '/settings'].includes(item.href));

    return (
        <header className="sticky top-0 z-[11] flex h-14 items-center gap-4 border-b bg-card px-4 md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 max-w-[280px]">
            <SheetHeader className="h-14 flex flex-row items-center border-b px-4 space-y-0">
                <SheetTitle asChild>
                <Link
                    href="/"
                    className="flex items-center gap-2 font-headline font-semibold"
                >
                    <Logo className="h-6 w-6 text-primary" />
                    <span>ClassSync</span>
                </Link>
                </SheetTitle>
            </SheetHeader>
            <nav className="grid gap-2 text-lg font-medium p-4">
                {visibleNavItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSheetOpen(false)}
                    className={cn(
                    "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                    pathname === item.href && "bg-muted text-foreground"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
                ))}
            </nav>
                <div className="mt-auto p-4">
                    <AccountDropdown mobile setIsSheetOpen={setIsSheetOpen} />
                </div>
            </SheetContent>
        </Sheet>
        <div className="w-full flex-1">
            <h1 className="font-headline text-lg font-semibold">
                {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h1>
        </div>
        </header>
    );
}


function AccountDropdown({ mobile, setIsSheetOpen }: { mobile?: boolean, setIsSheetOpen?: (open: boolean) => void }) {
  const auth = useAuth();
  const { user } = useUser();
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
        <Button variant={mobile ? "outline" : "secondary"} className="w-full justify-start">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
        </Button>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const handleItemClick = () => {
    if (setIsSheetOpen) {
      setIsSheetOpen(false);
    }
  };

  const dropdownContent = (
    <DropdownMenuContent className={cn("mb-2", "w-[245px]")} side={mobile ? 'bottom' : 'top'} align="end">
        <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/profile"><DropdownMenuItem onClick={handleItemClick}><UserIcon className="mr-2 h-4 w-4" />Profile</DropdownMenuItem></Link>
        <Link href="/settings"><DropdownMenuItem onClick={handleItemClick}><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem></Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { auth.signOut(); handleItemClick(); }}><LogOut className="mr-2 h-4 w-4" />Sign Out</DropdownMenuItem>
    </DropdownMenuContent>
  );

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant={mobile ? "outline" : "secondary"} className="w-full justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Avatar className="w-6 h-6">
                        <AvatarFallback>{profile?.displayName ? getInitials(profile.displayName) : '??'}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{profile?.displayName || "My Account"}</span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
        </DropdownMenuTrigger>
        {dropdownContent}
    </DropdownMenu>
  );
}
