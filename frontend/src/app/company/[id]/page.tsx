import React from 'react';
import { CompanyData } from '@/app/api/company/route';
import CompanyReport from '@/components/CompanyReport';
import CommentSection from '@/components/CommentSection';
import SharingLinks from '@/components/SharingLinks';
import CompanyRequestSection from '@/components/CompanyRequestSection';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function CompanyPage({ params }: { params: { id: string } }) {
  const [company, setCompany] = React.useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [isSharingOpen, setIsSharingOpen] = React.useState(false);

  // Check if user is logged in
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setIsLoggedIn(data.success && data.user);
        
        // If logged in, check if company is bookmarked
        if (data.success && data.user) {
          checkBookmarkStatus();
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    
    checkAuth();
  }, []);

  // Fetch company data
  React.useEffect(() => {
    const fetchCompany = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/company?id=${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setCompany(data.company);
          
          // Add to recently viewed
          addToRecentlyViewed(params.id);
        } else {
          setError(data.error || 'Failed to load company data');
        }
      } catch (error) {
        console.error('Error fetching company:', error);
        setError('An error occurred while loading the company data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompany();
  }, [params.id]);

  // Check if company is bookmarked
  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch('/api/bookmarks/list');
      const data = await response.json();
      
      if (data.success && data.bookmarks) {
        const isBookmarked = data.bookmarks.some(
          (bookmark: any) => bookmark.companyId === params.id
        );
        setIsBookmarked(isBookmarked);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  // Add to recently viewed
  const addToRecentlyViewed = (companyId: string) => {
    try {
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      
      // Remove if already exists
      const filtered = recentlyViewed.filter((id: string) => id !== companyId);
      
      // Add to beginning
      filtered.unshift(companyId);
      
      // Keep only last 10
      const updated = filtered.slice(0, 10);
      
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating recently viewed:', error);
    }
  };

  // Toggle bookmark
  const handleToggleBookmark = async () => {
    if (!isLoggedIn) return;
    
    try {
      if (isBookmarked) {
        // Remove bookmark
        await fetch(`/api/bookmarks?companyId=${params.id}`, {
          method: 'DELETE',
        });
      } else {
        // Add bookmark
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId: params.id,
          }),
        });
      }
      
      // Update bookmark status
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Handle share
  const handleShare = () => {
    setIsSharingOpen(true);
  };

  if (isLoading) {
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
          <div className="animate-pulse space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-neutral-700 rounded-md"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-neutral-700 rounded w-64"></div>
                    <div className="h-4 bg-neutral-700 rounded w-96"></div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-64 h-40 bg-neutral-700 rounded-md"></div>
            </div>
            
            <div className="space-y-4">
              <div className="h-6 bg-neutral-700 rounded w-48"></div>
              <div className="h-4 bg-neutral-700 rounded w-full"></div>
              <div className="h-4 bg-neutral-700 rounded w-full"></div>
              <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
            </div>
            
            <div className="h-80 bg-neutral-700 rounded"></div>
            
            <div className="space-y-4">
              <div className="h-6 bg-neutral-700 rounded w-48"></div>
              <div className="h-4 bg-neutral-700 rounded w-full"></div>
              <div className="h-4 bg-neutral-700 rounded w-full"></div>
              <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !company) {
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
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Company Not Found</h1>
            <p className="text-gray-400 mb-8">
              {error || "We couldn't find the company you're looking for."}
            </p>
            <div className="flex justify-center gap-4">
              <a href="/" className="bg-neon-green text-black px-6 py-3 rounded-md hover:bg-neon-green/90">
                Back to Home
              </a>
              <a href="/request" className="bg-neutral-800 text-white px-6 py-3 rounded-md hover:bg-neutral-700">
                Request a Company
              </a>
            </div>
          </div>
          
          <CompanyRequestSection isLoggedIn={isLoggedIn} />
        </main>
      </div>
    );
  }

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
        <div className="mb-6">
          <a href="/" className="text-gray-400 hover:text-white flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to search
          </a>
        </div>
        
        <CompanyReport 
          company={company}
          isBookmarked={isBookmarked}
          onBookmark={handleToggleBookmark}
          onShare={handleShare}
        />
        
        <CommentSection 
          companyId={params.id}
          isLoggedIn={isLoggedIn}
        />
        
        <CompanyRequestSection isLoggedIn={isLoggedIn} />
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
      
      <Dialog open={isSharingOpen} onOpenChange={setIsSharingOpen}>
        <DialogContent className="bg-neutral-900 text-white border-neutral-700">
          <SharingLinks 
            companyId={params.id}
            companyName={company.name}
            onClose={() => setIsSharingOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
