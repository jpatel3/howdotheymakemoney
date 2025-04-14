import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { CompanySearchResult } from '@/app/api/search/route';

interface SearchResultsProps {
  results: CompanySearchResult[];
  isLoading?: boolean;
}

export default function SearchResults({ results, isLoading = false }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full bg-neutral-800/50 animate-pulse">
              <CardContent className="p-6 h-32"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 text-center">
        <p className="text-lg text-gray-400">No companies found. Try a different search term.</p>
        <div className="mt-4">
          <Link 
            href="/request" 
            className="text-neon-green hover:underline"
          >
            Request a company to be added
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">Search Results</h2>
      <div className="flex flex-col gap-4">
        {results.map((company) => (
          <Link key={company.id} href={`/company/${company.id}`}>
            <Card className="w-full bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {company.logo ? (
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-neutral-700 flex-shrink-0">
                      <img 
                        src={company.logo} 
                        alt={`${company.name} logo`} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-neutral-700 flex-shrink-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-neutral-500">
                        {company.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">{company.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{company.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-neutral-700 text-gray-300">
                        {company.industry}
                      </span>
                      <span className="text-xs text-positive-green">
                        Primary Revenue: {company.primaryRevenue}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
