import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface CompanyRequestProps {
  isLoggedIn: boolean;
}

interface CompanyRequestItem {
  id: number;
  companyName: string;
  description: string;
  userId: number;
  status: string;
  votes: number;
  createdAt: string;
  updatedAt: string;
}

export default function CompanyRequestSection({ isLoggedIn }: CompanyRequestProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [companyName, setCompanyName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [requests, setRequests] = React.useState<CompanyRequestItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch company requests
  React.useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/company-requests?status=pending');
        const data = await response.json();
        
        if (data.success) {
          setRequests(data.requests);
        }
      } catch (error) {
        console.error('Error fetching company requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Submit company request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim() || !isLoggedIn) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/company-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          description,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh requests
        const requestsResponse = await fetch('/api/company-requests?status=pending');
        const requestsData = await requestsResponse.json();
        
        if (requestsData.success) {
          setRequests(requestsData.requests);
          setCompanyName('');
          setDescription('');
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error('Error submitting company request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Company Requests</h2>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-neon-green text-black hover:bg-neon-green/90"
          disabled={!isLoggedIn}
        >
          Request a Company
        </Button>
      </div>
      
      {!isLoggedIn && (
        <div className="bg-neutral-800 p-4 rounded-lg mb-6 text-center">
          <p className="text-gray-400">
            <a href="/login" className="text-neon-green hover:underline">Log in</a> to request companies or vote
          </p>
        </div>
      )}
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-neutral-800 p-4 rounded-lg animate-pulse h-24"></div>
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="bg-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center space-y-1 pr-4 border-r border-neutral-700">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={!isLoggedIn}
                      className="text-gray-400 hover:text-neon-green"
                    >
                      <ArrowUp className="h-5 w-5" />
                    </Button>
                    <span className="font-medium text-white">{request.votes}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={!isLoggedIn}
                      className="text-gray-400 hover:text-negative-red"
                    >
                      <ArrowDown className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">{request.companyName}</h3>
                    {request.description && (
                      <p className="text-gray-400 mt-1">{request.description}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">Requested on {formatDate(request.createdAt)}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-neutral-700 text-gray-300">
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-neutral-800 rounded-lg">
          <p className="text-gray-400">No company requests yet. Be the first to request a company!</p>
        </div>
      )}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-neutral-900 text-white border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-xl">Request a Company</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium text-gray-300">
                Company Name
              </label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Stripe, Bloomberg, Anduril"
                required
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-300">
                Why are you interested in this company? (Optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us why you want to learn about this company's business model"
                className="bg-neutral-800 border-neutral-700 min-h-24"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsOpen(false)}
                className="text-gray-400"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!companyName.trim() || isSubmitting}
                className="bg-neon-green text-black hover:bg-neon-green/90"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
