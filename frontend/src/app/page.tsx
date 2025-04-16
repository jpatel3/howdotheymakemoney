'use client';

import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';
import { CompanySearchResult } from '@/app/api/search/route';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [featuredCompanies, setFeaturedCompanies] = useState<CompanySearchResult[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<CompanySearchResult[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState<CompanySearchResult[]>([]);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setIsLoggedIn(data.success && data.user);
        
        // If logged in, fetch bookmarks
        if (data.success && data.user) {
          fetchBookmarks();
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    
    checkAuth();
  }, []);

  // Fetch featured companies
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // In a real implementation, this would be a dedicated API endpoint
        // For now, we'll use the search API with predefined companies
        const featuredIds = ['google', 'tesla', 'stripe'];
        const companies: CompanySearchResult[] = [];
        
        for (const id of featuredIds) {
          const response = await fetch(`/api/search?q=${id}`);
          const data = await response.json();
          
          if (data.success && data.results.length > 0) {
            companies.push(data.results[0]);
          }
        }
        
        setFeaturedCompanies(companies);
      } catch (error) {
        console.error('Error fetching featured companies:', error);
      }
    };
    
    fetchFeatured();
  }, []);

  // Fetch recently viewed companies from localStorage
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const companies: CompanySearchResult[] = [];
        
        for (const id of recentIds.slice(0, 3)) {
          const response = await fetch(`/api/search?q=${id}`);
          const data = await response.json();
          
          if (data.success && data.results.length > 0) {
            companies.push(data.results[0]);
          }
        }
        
        setRecentlyViewed(companies);
      } catch (error) {
        console.error('Error fetching recently viewed companies:', error);
      }
    };
    
    fetchRecentlyViewed();
  }, []);

  // Fetch bookmarked companies
  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks/list');
      const data = await response.json();
      
      if (data.success && data.bookmarks) {
        const companies: CompanySearchResult[] = [];
        
        for (const bookmark of data.bookmarks) {
          const companyResponse = await fetch(`/api/search?q=${bookmark.companyId}`);
          const companyData = await companyResponse.json();
          
          if (companyData.success && companyData.results.length > 0) {
            companies.push(companyData.results[0]);
          }
        }
        
        setBookmarkedCompanies(companies);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Error searching companies:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestCompany = () => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/request');
    } else {
      router.push('/request');
    }
  };

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Understand how companies make money
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Clear, digestible information about revenue breakdowns and business models of the world's most interesting companies.
            </p>
            
            {/* Search Bar */}
            <div className="mt-10 flex justify-center">
              <div className="w-full max-w-lg">
                <SearchBar 
                  onSearch={handleSearch}
                  placeholder="Search for a company..."
                  initialValue={searchQuery}
                />
              </div>
            </div>

            {/* Search Results */}
            {hasSearched && (
              <div className="mt-8">
                <SearchResults 
                  results={searchResults}
                  isLoading={isSearching}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild>
                <Link href="/companies">
                  Browse All Companies
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRequestCompany}
              >
                Request a Company
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
