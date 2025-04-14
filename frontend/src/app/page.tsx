'use client';

import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';
import { CompanySearchResult } from '@/app/api/search/route';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [featuredCompanies, setFeaturedCompanies] = useState<CompanySearchResult[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<CompanySearchResult[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState<CompanySearchResult[]>([]);

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

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <header className="bg-neutral-900 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-neon-green">
            HowDoTheyMakeMoney.com
          </a>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <a href="/bookmarks" className="text-gray-300 hover:text-white">
                  Bookmarks
                </a>
                <div className="relative group">
                  <button className="text-gray-300 hover:text-white">
                    Account
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700">
                      Profile
                    </a>
                    <a href="/bookmarks" className="block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700">
                      Bookmarks
                    </a>
                    <a href="/api/auth/logout" className="block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700">
                      Log Out
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <a href="/login" className="text-gray-300 hover:text-white">
                  Log In
                </a>
                <a href="/signup" className="bg-neon-green text-black px-4 py-2 rounded-md hover:bg-neon-green/90">
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            How do companies actually make money?
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover the business models behind the world's most interesting companies
          </p>
          
          <div className="flex justify-center">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search for a company..."
              initialValue={searchQuery}
            />
          </div>
        </div>
        
        {hasSearched ? (
          <SearchResults 
            results={searchResults}
            isLoading={isSearching}
          />
        ) : (
          <div className="space-y-12">
            {featuredCompanies.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6">Featured Companies</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredCompanies.map((company) => (
                    <a 
                      key={company.id} 
                      href={`/company/${company.id}`}
                      className="bg-neutral-800 rounded-lg p-6 hover:bg-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {company.logo ? (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-neutral-700 flex-shrink-0">
                            <img 
                              src={company.logo} 
                              alt={`${company.name} logo`} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-neutral-700 flex-shrink-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-neutral-500">
                              {company.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <h3 className="text-lg font-medium">{company.name}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{company.description}</p>
                      <div className="text-xs text-positive-green">
                        Primary Revenue: {company.primaryRevenue}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}
            
            {isLoggedIn && bookmarkedCompanies.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6">Your Bookmarks</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {bookmarkedCompanies.map((company) => (
                    <a 
                      key={company.id} 
                      href={`/company/${company.id}`}
                      className="bg-neutral-800 rounded-lg p-6 hover:bg-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {company.logo ? (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-neutral-700 flex-shrink-0">
                            <img 
                              src={company.logo} 
                              alt={`${company.name} logo`} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-neutral-700 flex-shrink-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-neutral-500">
                              {company.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <h3 className="text-lg font-medium">{company.name}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{company.description}</p>
                      <div className="text-xs text-positive-green">
                        Primary Revenue: {company.primaryRevenue}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}
            
            {recentlyViewed.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6">Recently Viewed</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentlyViewed.map((company) => (
                    <a 
                      key={company.id} 
                      href={`/company/${company.id}`}
                      className="bg-neutral-800 rounded-lg p-6 hover:bg-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {company.logo ? (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-neutral-700 flex-shrink-0">
                            <img 
                              src={company.logo} 
                              alt={`${company.name} logo`} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-neutral-700 flex-shrink-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-neutral-500">
                              {company.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <h3 className="text-lg font-medium">{company.name}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{company.description}</p>
                      <div className="text-xs text-positive-green">
                        Primary Revenue: {company.primaryRevenue}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      
      <footer className="bg-neutral-900 border-t border-neutral-800 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400">
                © {new Date().getFullYear()} HowDoTheyMakeMoney.com
              </p>
            </div>
            <div className="flex gap-6">
              <a href="/about" className="text-gray-400 hover:text-white">
                About
              </a>
              <a href="/request" className="text-gray-400 hover:text-white">
                Request a Company
              </a>
              <a href="/privacy" className="text-gray-400 hover:text-white">
                Privacy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
