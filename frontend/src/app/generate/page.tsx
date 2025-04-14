import React from 'react';
import { CompanyData } from '@/app/api/company/route';
import ReportGenerator from '@/components/ReportGenerator';
import CompanyReport from '@/components/CompanyReport';
import { Button } from '@/components/ui/button';

export default function GeneratePage() {
  const [generatedReport, setGeneratedReport] = React.useState<CompanyData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  // Check if user is logged in
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setIsLoggedIn(data.success && data.user);
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    
    checkAuth();
  }, []);

  const handleReportGenerated = (report: CompanyData) => {
    setGeneratedReport(report);
    
    // Scroll to report
    setTimeout(() => {
      document.getElementById('generated-report')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setGeneratedReport(null);
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
        <div className="mb-6">
          <a href="/" className="text-gray-400 hover:text-white flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </a>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Generate a Company Report
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Can't find a company? Generate a new report on how they make money.
          </p>
        </div>
        
        {!generatedReport ? (
          <ReportGenerator onReportGenerated={handleReportGenerated} />
        ) : (
          <div id="generated-report">
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Generated Report</h2>
              <Button 
                onClick={handleReset}
                variant="outline"
              >
                Generate Another Report
              </Button>
            </div>
            
            <CompanyReport 
              company={generatedReport}
              isBookmarked={false}
              onBookmark={undefined}
              onShare={undefined}
            />
            
            <div className="mt-12 text-center">
              <p className="text-gray-400 mb-4">
                This report was generated automatically and may contain inaccuracies.
              </p>
              <p className="text-gray-400">
                If you spot any issues, please help improve our database by submitting corrections.
              </p>
            </div>
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
