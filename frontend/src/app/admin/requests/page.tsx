'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Define the company request type (adjust based on actual API response)
interface CompanyRequest {
  id: number;
  companyName: string;
  status: string; // pending, processing, approved, rejected, failed
  createdAt: number | string; // Adjust type based on actual data
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function AdminCompanyRequestsPage() {
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({}); // Track loading per request
  const [actionError, setActionError] = useState<Record<number, string | null>>({}); // Track errors per request

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/company-requests');
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Forbidden: You do not have permission to view this page.');
          } else if (response.status === 401) {
             throw new Error('Unauthorized: Please log in as an admin.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); 
        // Assuming the API returns an array directly
        // If it's nested like { requests: [...] }, adjust data access here
        setRequests(data);
      } catch (err) {
        console.error('Failed to fetch company requests:', err);
        if (err instanceof Error) {
           setError(`Failed to load requests: ${err.message}`);
        } else {
           setError('An unknown error occurred while loading requests.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    setActionError(prev => ({ ...prev, [id]: null }));
    
    try {
      // Call the PATCH endpoint without a body for approval -> processing
      const response = await fetch(`/api/admin/company-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // No body needed for this action
      });

      // Expect 202 Accepted for successful queueing
      if (response.status === 202) {
         // Update local state immediately to 'processing'
         setRequests(prevRequests => 
           prevRequests.map(req => 
             req.id === id ? { ...req, status: 'processing' } : req
           )
         );
      } else {
          // Handle other potential errors (400, 401, 403, 404, 409, 500)
          const data = await response.json().catch(() => ({})); // Try parsing error
          throw new Error(data.error || `API Error: ${response.status}`);
      }

    } catch (err) {
      console.error(`Error approving request ${id}:`, err);
      setActionError(prev => ({ ...prev, [id]: err instanceof Error ? err.message : 'Failed to start processing' }));
    } finally {
      // Keep loading state until background job completes? 
      // For now, just stop the button loading state after API call returns.
      setActionLoading(prev => ({ ...prev, [id]: false })); 
    }
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'processing': return 'text-blue-600'; // Add color for processing
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'failed': return 'text-destructive'; // Add color for failed processing
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin: Company Requests</h1>

      {/* Disclaimer about Auto-fetching */}
      <div className="mb-6 p-4 border border-border bg-card rounded-md text-sm text-muted-foreground">
        <p className='font-medium mb-1'>Note on Approval Process:</p>
        <p>Approving a request initiates an automated process to fetch company data (description, logo, etc.) using web searches. This data is a best guess and <strong className="text-foreground">may require review and manual edits</strong> for accuracy after the process completes (status changes to \'approved\'). Failed attempts will change the status to \'failed\'.</p>
      </div>

      {isLoading && (
        <div className="p-4 text-center text-muted-foreground">Loading requests...</div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && requests.length === 0 && (
        <div className="p-4 border border-border rounded-md text-center text-muted-foreground">
          No pending company requests found.
        </div>
      )}

      {!isLoading && !error && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4 p-4 border border-border rounded-lg bg-card">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg">{request.companyName}</p>
                <p className="text-sm text-muted-foreground">
                  Requested by: {request.user.name} ({request.user.email}) on {new Date(request.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm capitalize">
                  Status: <span className={`font-medium ${getStatusColor(request.status)}`}>{request.status}</span>
                </p>
                {actionError[request.id] && (
                    <p className="text-xs text-destructive mt-1">Error: {actionError[request.id]}</p>
                )}
              </div>
              <div className="flex flex-shrink-0 space-x-2">
                {(request.status === 'pending' || request.status === 'failed') && (
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={() => handleApprove(request.id)}
                    disabled={actionLoading[request.id]}
                  >
                    {actionLoading[request.id] ? 'Starting...' : (request.status === 'failed' ? 'Retry Approve' : 'Approve')}
                  </Button>
                )}
                {(request.status === 'pending' || request.status === 'failed') && (
                  <Button 
                    variant="destructive"
                    size="sm" 
                    disabled={actionLoading[request.id] || (request.status !== 'pending' && request.status !== 'failed')}
                  >
                    Reject
                  </Button>
                )}
                 {request.status === 'processing' && (
                    <span className="text-sm text-blue-600 font-medium px-3 py-1.5">Processing...</span>
                )}
                 {request.status === 'approved' && (
                    <span className="text-sm text-green-600 font-medium px-3 py-1.5">Approved</span>
                )}
                 {request.status === 'rejected' && (
                    <span className="text-sm text-red-600 font-medium px-3 py-1.5">Rejected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 