import React from 'react';
import { CompanyData } from '@/app/api/company/route';
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
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
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
              <p className="text-gray-400 mt-1">{company.description}</p>
            </div>
          </div>
        </div>
        
        <Card className="w-full md:w-64 bg-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Facts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Founded:</span>
              <span>{company.founded}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Headquarters:</span>
              <span>{company.headquarters.split(',')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span>{company.publiclyTraded ? 'Public' : 'Private'}</span>
            </div>
            {company.stockSymbol && (
              <div className="flex justify-between">
                <span className="text-gray-400">Symbol:</span>
                <span>{company.stockSymbol}</span>
              </div>
            )}
            {company.employees && (
              <div className="flex justify-between">
                <span className="text-gray-400">Employees:</span>
                <span>{company.employees.toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-neutral-700 pb-2">
          How They Make Money
        </h2>
        <p className="text-gray-300 mb-8 text-lg leading-relaxed">
          {company.businessModel}
        </p>
        
        <div className="bg-neutral-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-medium mb-4 text-white">Revenue Breakdown</h3>
          <RevenueBreakdownChart segments={company.revenueSegments} />
        </div>
        
        <div className="space-y-4 mt-8">
          {company.revenueSegments.map((segment, index) => (
            <div key={index} className="bg-neutral-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">{segment.name}</h4>
                <span className="text-neon-green font-semibold">{segment.percentage}%</span>
              </div>
              <p className="text-gray-400">{segment.description}</p>
              {segment.amount && (
                <p className="text-sm text-gray-500 mt-1">
                  Approximately ${(segment.amount / 1000000000).toFixed(1)} billion
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-neutral-700 pb-2">
          Key Revenue Drivers
        </h2>
        <ul className="space-y-3 text-gray-300">
          {company.keyRevenueDrivers.map((driver, index) => (
            <li key={index} className="flex items-start">
              <span className="text-neon-green mr-2">•</span>
              <span>{driver}</span>
            </li>
          ))}
        </ul>
      </section>
      
      {company.financials && company.financials.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-white border-b border-neutral-700 pb-2">
            Financial Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-neutral-800 rounded-lg">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="p-4 text-left">Year</th>
                  <th className="p-4 text-left">Revenue</th>
                  {company.financials[0].netIncome !== undefined && (
                    <th className="p-4 text-left">Net Income</th>
                  )}
                  {company.financials[0].operatingIncome !== undefined && (
                    <th className="p-4 text-left">Operating Income</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {company.financials.map((financial, index) => (
                  <tr key={index} className="border-b border-neutral-700 last:border-0">
                    <td className="p-4">{financial.year}</td>
                    <td className="p-4">${(financial.revenue / 1000000000).toFixed(1)}B</td>
                    {financial.netIncome !== undefined && (
                      <td className="p-4">${(financial.netIncome / 1000000000).toFixed(1)}B</td>
                    )}
                    {financial.operatingIncome !== undefined && (
                      <td className="p-4">${(financial.operatingIncome / 1000000000).toFixed(1)}B</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-neutral-700 pb-2">
          Sources
        </h2>
        <ul className="space-y-2 text-gray-400">
          {company.sources.map((source, index) => (
            <li key={index}>
              <a 
                href={source} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-interactive-blue hover:underline"
              >
                {source}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-500 mt-4">
          Last updated: {company.lastUpdated}
        </p>
      </section>
    </div>
  );
}
