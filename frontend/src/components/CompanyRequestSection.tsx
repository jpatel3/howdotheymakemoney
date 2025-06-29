import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

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
  
  // State for confirmation dialog
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [requestIdToDelete, setRequestIdToDelete] = React.useState<number | null>(null);

  // Fetch company requests
  React.useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/company-requests?status=pending');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setRequests(data.requests);
        } else {
          console.error('Failed to fetch requests:', data.error || response.statusText);
          setRequests([]);
        }
      } catch (error) {
        console.error('Error fetching company requests:', error);
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchRequests();
    } else {
      setIsLoading(false);
      setRequests([]);
    }
  }, [isLoggedIn]);

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
          companyName: companyName.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const requestsResponse = await fetch('/api/company-requests?status=pending');
        const requestsData = await requestsResponse.json();
        
        if (requestsResponse.ok && requestsData.success) {
          setRequests(requestsData.requests);
        } else {
          console.error('Failed to re-fetch requests after submit:', requestsData.error || requestsResponse.statusText);
        }
        setCompanyName('');
        setIsOpen(false);
      } else {
        console.error('Error submitting company request:', data.error || response.statusText);
      }
    } catch (error) {
      console.error('Error submitting company request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Request
  const handleDeleteRequest = async (requestId: number | null) => {
    if (requestId === null) return; // Should not happen if logic is correct
    
    try {
      const response = await fetch(`/api/company-requests/${requestId}`, {
        method: 'DELETE',
      });

      if (response.ok) { 
        setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
        console.log(`Successfully deleted request ${requestId} from UI.`);
      } else {
        const errorData = await response.json().catch(() => ({})); 
        console.error(`Failed to delete request ${requestId}:`, response.status, errorData.error || response.statusText);
        // TODO: Show error notification to the user (e.g., using a Toast component)
      }
    } catch (error) {
      console.error(`Network or unexpected error deleting request ${requestId}:`, error);
      // TODO: Show error notification to the user
    }
  };

  // --- Function to open confirmation dialog ---
  const openDeleteConfirmation = (requestId: number) => {
    setRequestIdToDelete(requestId);
    setIsConfirmOpen(true);
  };
  // --- End Function to open confirmation dialog ---

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
        <h2 className="text-2xl font-semibold text-foreground">Company Requests</h2>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!isLoggedIn}
        >
          Request a Company
        </Button>
      </div>
      
      {!isLoggedIn && (
        <Card className="mb-6">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">
              <a href="/login" className="text-primary hover:underline">Log in</a> to request companies or vote
            </p>
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-24"><CardContent className="p-4"></CardContent></Card>
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center space-y-1 pr-4 border-r border-border">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={!isLoggedIn}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ArrowUp className="h-5 w-5" />
                    </Button>
                    <span className="font-medium text-foreground">{request.votes || 0}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={!isLoggedIn}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <ArrowDown className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-foreground">{request.companyName}</h3>
                    {request.description && (
                      <p className="text-muted-foreground mt-1">{request.description}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">Requested on {formatDate(request.createdAt)}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-auto"
                    onClick={() => openDeleteConfirmation(request.id)} 
                    aria-label="Delete request"
                    disabled={!isLoggedIn}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">No company requests yet. Be the first to request one!</p>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl text-card-foreground">Request a Company</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium text-muted-foreground">
                Company Name
              </label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Stripe, Bloomberg, Anduril"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-muted-foreground">
                Why are you interested in this company? (Optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us why you want to learn about this company's business model"
                className="min-h-24"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!companyName.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your company request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRequestIdToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                handleDeleteRequest(requestIdToDelete);
                // Optionally reset requestIdToDelete here if needed, though closing dialog implicitly handles it
              }}
              // Add destructive styling variant if available/desired
              // className={buttonVariants({ variant: "destructive" })} 
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
