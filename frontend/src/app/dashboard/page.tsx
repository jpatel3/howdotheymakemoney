'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Use Next.js Image for optimization
import { Button } from '@/components/ui/button';

// Define the company type based on schema (adjust if needed)
interface Company {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  primaryRevenue: string;
  revenueBreakdown: string;
  businessModel: string;
  createdAt: number; // Assuming timestamp or string date
}

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Company[] = await response.json();
        setCompanies(data);
      } catch (err) {
        console.error('Failed to fetch companies:', err);
        setError('Failed to load companies. Please try again later.');
        if (err instanceof Error) {
           setError(`Failed to load companies: ${err.message}`);
        } else {
           setError('An unknown error occurred while loading companies.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Company Dashboard</h1>

      {isLoading && (
        <div className="p-4 text-center text-muted-foreground">
          Loading companies...
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && companies.length === 0 && (
        <div className="p-4 border border-border rounded-md text-center text-muted-foreground">
          No companies found.
          {/* Optionally add a link/button to request or add one */}
        </div>
      )}

      {!isLoading && !error && companies.length > 0 && (
        <div className="space-y-4">
          {companies.map((company) => (
            <div key={company.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors">
              {/* Logo */}
              <div className="flex-shrink-0">
                {company.logo ? (
                  <Image 
                    src={company.logo} 
                    alt={`${company.name} logo`} 
                    width={48} 
                    height={48} 
                    className="rounded-md object-contain h-12 w-12 border border-border"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xl font-semibold">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Name & Description */}
              <div className="flex-1 min-w-0">
                <Link href={`/company/${company.id}`} className="font-semibold text-lg hover:underline">
                  {company.name}
                </Link>
                <p className="text-sm text-muted-foreground truncate">
                  {company.description || 'No description available.'}
                </p>
              </div>
              {/* View Button */}
              <Button asChild variant="outline" size="sm">
                <Link href={`/company/${company.id}`}>View Details</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 