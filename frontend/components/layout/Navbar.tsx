'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/layout/UserNav';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/leadership', label: 'Leadership' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
];

const authenticatedLinks = [
  { href: '/elections', label: 'Elections' },
];

const resourceLinks = [
  { href: '/academics', label: 'Academics (Pasco)' },
  { href: '/career', label: 'Career (Jobs)' },
  { href: '/market', label: 'Marketplace (Mart)' },
  { href: '/constitution', label: 'Constitution' },
  { href: '/welfare', label: 'Welfare' },
  { href: '/lost-and-found', label: 'Lost and Found' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden border border-border">
              <Image src="/dasa_logo.jpg" alt="DASA KNUST" width={40} height={40} className="object-cover w-full h-full" />
            </div>
            <span className="hidden sm:inline-block font-bold text-xl">
              DASA KNUST
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && authenticatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium transition-colors hover:text-primary outline-none cursor-pointer">
                Resources <ChevronDown className="cursor-pointer ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {resourceLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="w-full cursor-pointer">
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationBell className="cursor-pointer" />
                <UserNav />
              </>
            ) : (
              <>
                <Link href="/auth/login" className="cursor-pointer">
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register" className="cursor-pointer">
                  <Button size="sm" className="cursor-pointer">Join</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col space-y-4 pb-6">
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated && authenticatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="py-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Resources</h4>
                  <div className="flex flex-col space-y-3 pl-4 border-l-2">
                    {resourceLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-base font-medium transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Auth Section - Mobile */}
                <div className="pt-4 border-t">
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account</span>
                        <div className="flex items-center space-x-3">
                          <NotificationBell className="cursor-pointer" />
                          <UserNav />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Join</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
