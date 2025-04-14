import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CompanyData } from '@/app/api/company/route';

interface ReportGeneratorProps {
  onReportGenerated: (report: CompanyData) => void;
}

export default function ReportGenerator({ onReportGenerated }: ReportGeneratorProps) {
  const [companyName, setCompanyName] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [publicInfo, setPublicInfo] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          industry: industry.trim() || undefined,
          publicInfo: publicInfo.trim() || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        onReportGenerated(data.report);
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('An error occurred while generating the report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-neutral-800 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6 text-white">Generate Company Report</h2>
      
      {error && (
        <div className="bg-negative-red/20 border border-negative-red text-white p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="companyName" className="text-sm font-medium text-gray-300">
            Company Name *
          </label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Stripe, Bloomberg, Anduril"
            required
            className="bg-neutral-700 border-neutral-600"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="industry" className="text-sm font-medium text-gray-300">
            Industry (Optional)
          </label>
          <Input
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g., Technology, Finance, Healthcare"
            className="bg-neutral-700 border-neutral-600"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="publicInfo" className="text-sm font-medium text-gray-300">
            Additional Information (Optional)
          </label>
          <Textarea
            id="publicInfo"
            value={publicInfo}
            onChange={(e) => setPublicInfo(e.target.value)}
            placeholder="Any additional information about the company that might help generate a more accurate report"
            className="bg-neutral-700 border-neutral-600 min-h-24"
          />
        </div>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={!companyName.trim() || isGenerating}
            className="w-full bg-neon-green text-black hover:bg-neon-green/90 h-12 text-lg"
          >
            {isGenerating ? 'Generating Report...' : 'Generate Report'}
          </Button>
        </div>
      </form>
    </div>
  );
}
