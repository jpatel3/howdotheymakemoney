'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: number;
  email: string;
  name?: string;
  role?: string;
  isAdmin?: boolean;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        // Assume an endpoint exists to get the current user session
        // This relies on the httpOnly cookie being sent automatically
        const response = await fetch('/api/auth/me'); 
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        setUser(null); // Update state immediately
        router.push('/'); // Redirect to home page
        // Optionally force a page reload if state isn't updating everywhere needed
        // window.location.reload(); 
      } else {
        console.error('Logout failed:', await response.text());
        // Show error message to user?
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-xl font-semibold">How They Make Money</span>
            {/* Optional: Add logo here */}
            {/* <img className="h-8 w-auto" src="/logo.svg" alt="" /> */}
          </Link>
        </div>
        {/* Optional: Add main navigation links here if needed */}
        {/* <div className="hidden lg:flex lg:gap-x-12">
          <Link href="/about" className="text-sm font-semibold leading-6 text-foreground">About</Link>
        </div> */}
        <div className="flex flex-1 justify-end items-center gap-x-4">
          {isLoading ? (
            <div className="h-6 w-24 bg-muted rounded animate-pulse"></div> // Simple loading state
          ) : user ? (
            // Check if user is admin
            user.isAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {user.name || user.email} 
                    {/* Optional: Add dropdown indicator icon */}
                    {/* <ChevronDown className="ml-1 h-4 w-4" /> */}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/requests">Review Requests</Link>
                  </DropdownMenuItem>
                  {/* Add other admin links here if needed */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Regular user view
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Welcome, {user.name || user.email}!
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            )
          ) : (
            // Logged out view
            <>
              <Button variant="ghost" size="sm" asChild>
                 <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
} 