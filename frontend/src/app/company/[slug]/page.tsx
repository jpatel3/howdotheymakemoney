'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; 
import Image from 'next/image';
// Adjust the import path if the API route structure changed
import { CompanyData } from '@/app/api/company/[slug]/route'; 
import CompanyReport from '@/components/CompanyReport';
import CommentSection from '@/components/CommentSection';
import SharingLinks from '@/components/SharingLinks';
import CompanyRequestSection from '@/components/CompanyRequestSection';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bookmark, Share } from 'lucide-react';

export default function CompanySlugPage() { 
  const params = useParams();
  const companySlugParam = params.slug;
  const companySlug = Array.isArray(companySlugParam) ? companySlugParam[0] : companySlugParam;

  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSharingOpen, setIsSharingOpen] = useState(false);

  // Check Auth Effect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setIsLoggedIn(data.success && data.user);
      } catch (error) { console.error('Error checking auth status:', error); }
    };
    checkAuth();
  }, []);

  // Add to Recently Viewed Function
  const addToRecentlyViewed = (slug: string) => {
    try {
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewedSlugs') || '[]');
      const filtered = recentlyViewed.filter((s: string) => s !== slug);
      filtered.unshift(slug);
      const updated = filtered.slice(0, 10);
      localStorage.setItem('recentlyViewedSlugs', JSON.stringify(updated));
    } catch (error) { console.error('Error updating recently viewed slugs:', error); }
  };

  // Fetch Company Data Effect
  useEffect(() => {
    if (!companySlug) {
      setError('Company slug not found in URL.'); setIsLoading(false); return;
    }
    const fetchCompanyDetails = async () => {
      setIsLoading(true); setError(null);
      try {
        const response = await fetch(`/api/company/${companySlug}`);
        if (!response.ok) {
           if (response.status === 404) throw new Error('Company not found.');
           throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CompanyData = await response.json();
        setCompany(data);
        addToRecentlyViewed(companySlug);
      } catch (err) {
        console.error('Failed to fetch company details:', err);
        setError(err instanceof Error ? `Failed to load company details: ${err.message}` : 'Unknown error');
      } finally { setIsLoading(false); }
    };
    fetchCompanyDetails();
  }, [companySlug]);

  // Check Bookmark Status Effect
  useEffect(() => {
    if (isLoggedIn && company?.id) {
      const checkBookmark = async () => { 
          try {
            const response = await fetch('/api/bookmarks/list');
            const data = await response.json();
            if (data.success && data.bookmarks) {
              setIsBookmarked(data.bookmarks.some((b: any) => b.companyId === company.id));
            }
          } catch (error) { console.error('Error checking bookmark status:', error); }
      };
      checkBookmark();
    }
  }, [isLoggedIn, company]); 

  // Handle Toggle Bookmark Function
  const handleToggleBookmark = async () => {
    if (!isLoggedIn || !company) return;
    const companyIdToBookmark = company.id;
    try {
      if (isBookmarked) {
        await fetch(`/api/bookmarks?companyId=${companyIdToBookmark}`, { method: 'DELETE' });
      } else {
        await fetch('/api/bookmarks', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId: companyIdToBookmark }),
        });
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) { console.error('Error toggling bookmark:', error); }
  };

  // Handle Share Function
  const handleShare = () => { setIsSharingOpen(true); };

  // Render Logic
  if (isLoading) {
    return <div className="min-h-screen text-white flex items-center justify-center">Loading...</div>;
  }
  if (error) {
     return <div className="min-h-screen text-white flex items-center justify-center"><div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-center">{error}</div></div>;
  }
  if (!company) {
     return <div className="min-h-screen text-white flex items-center justify-center"><div className="p-4 border border-border rounded-md text-center text-muted-foreground">Company not found.</div></div>;
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 pt-6 pb-12">
        <div className="mb-6">
          <a href="/companies" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
             {/* Back arrow SVG */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             Back
          </a>
        </div>
        
        <CompanyReport 
          company={company}
          isBookmarked={isBookmarked}
          onBookmark={handleToggleBookmark}
          onShare={handleShare}
        />
        
        <CommentSection 
          companyId={String(company.id)}
          isLoggedIn={isLoggedIn}
        />
        
        <CompanyRequestSection isLoggedIn={isLoggedIn} />
      </main>
      
      <Dialog open={isSharingOpen} onOpenChange={setIsSharingOpen}>
        <DialogContent className="bg-neutral-900 text-white border-neutral-700">
          <SharingLinks 
            companyId={String(company.id)}
            companyName={company.name}
            onClose={() => setIsSharingOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 