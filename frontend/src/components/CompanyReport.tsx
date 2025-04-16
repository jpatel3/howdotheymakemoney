import React from 'react';
import { CompanyData } from '@/app/api/company/[slug]/route';
import RevenueBreakdownChart from './RevenueBreakdownChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Bookmark, BookmarkCheck } from 'lucide-react';

interface CompanyReportProps {
  company: CompanyData;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onShare?: () => void;
}

export default function CompanyReport({ 
  company, 
  isBookmarked = false,
  onBookmark,
  onShare
}: CompanyReportProps) {

  // Parse revenueBreakdown JSON string
  let parsedRevenueBreakdown: Record<string, string> = {};
  let revenueParseError = false;
  try {
    if (company.revenueBreakdown) {
      parsedRevenueBreakdown = JSON.parse(company.revenueBreakdown);
    } 
  } catch (e) {
    console.error("Failed to parse revenue breakdown JSON:", e);
    revenueParseError = true;
  }

  // Convert parsed object into an array format expected by chart/map if needed
  // OR update chart/map logic to handle the object directly.
  // Example conversion to array: [{ name: key, percentage: value }, ...]
  const revenueSegmentsArray = Object.entries(parsedRevenueBreakdown).map(([key, value]) => ({
      name: key,
      percentage: parseFloat(value) || 0, // Assuming value is like '81%', attempt to parse
      // description: '...', // Add descriptions if available elsewhere
      // amount: ... // Add amount if available elsewhere
  }));

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            {company.logo ? (
              <div className="w-20 h-20 rounded-md overflow-hidden bg-neutral-700 flex-shrink-0">
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`} 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-md overflow-hidden bg-neutral-700 flex-shrink-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-neutral-500">
                  {company.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                {company.name}
                <div className="flex gap-2">
                  {onBookmark && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={onBookmark}
                      className="text-gray-400 hover:text-neon-green"
                      title={isBookmarked ? "Remove bookmark" : "Bookmark this company"}
                    >
                      {isBookmarked ? 
                        <BookmarkCheck className="h-5 w-5 text-neon-green" /> : 
                        <Bookmark className="h-5 w-5" />
                      }
                    </Button>
                  )}
                  {onShare && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={onShare}
                      className="text-gray-400 hover:text-interactive-blue"
                      title="Share this report"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </h1>
              <p className="text-muted-foreground mt-1">{company.description}</p>
            </div>
          </div>
        </div>
        
        <Card className="w-full md:w-64 bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-card-foreground">Quick Facts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {/* <div className="flex justify-between">
              <span className="text-gray-400">Founded:</span>
              <span>{company.founded}</span>
            </div> */}
            {company.headquarters && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Headquarters:</span>
                {/* Safely access headquarters, provide fallback */}
                <span className="text-foreground">{company.headquarters?.split(',')[0] || 'N/A'}</span> 
              </div>
            )}
            {/* <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span>{company.publiclyTraded ? 'Public' : 'Private'}</span>
            </div> */}
            {/* {company.stockSymbol && (...)} */}
            {/* {company.employees && (...)} */}
            {company.website && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Website:</span>
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[150px]">
                  {company.website.replace(/^https?:\/\//, '')} 
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-foreground border-b pb-2">
          How They Make Money
        </h2>
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          {company.businessModel}
        </p>
        
        <div className="bg-card border rounded-lg p-6 mb-8">
          <h3 className="text-xl font-medium mb-4 text-card-foreground">Revenue Breakdown</h3>
          {revenueParseError ? (
             <p className='text-destructive text-sm'>Could not display revenue breakdown chart.</p>
          ) : (
             <RevenueBreakdownChart segments={revenueSegmentsArray} />
          )}
        </div>
        
        {!revenueParseError && revenueSegmentsArray.length > 0 && (
          <div className="space-y-4 mt-8">
            {revenueSegmentsArray.map((segment, index) => (
              <div key={index} className="bg-card border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-card-foreground">{segment.name}</h4>
                  <span className="text-primary font-semibold">{segment.percentage}%</span>
                </div>
                {/* <p className="text-gray-400">{segment.description}</p> */}
                {/* {segment.amount && (...)} */}
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Commented out sections requiring missing data */}
      {/* <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-neutral-700 pb-2">
          Key Revenue Drivers
        </h2>
        <ul className="space-y-3 text-gray-300">
          {company.keyRevenueDrivers.map((driver, index) => (...))}
        </ul>
      </section> */}
      
      {/* {company.financials && company.financials.length > 0 && (...)} */}
      
      {/* <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-neutral-700 pb-2">
          Sources
        </h2>
        <ul className="space-y-2 text-gray-400">
          {company.sources.map((source, index) => (...))}
        </ul>
        <p className="text-sm text-gray-500 mt-4">
          Last updated: {company.lastUpdated}
        </p>
      </section> */}
    </div>
  );
}
