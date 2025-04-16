'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Define the company request type (adjust based on actual API response)
interface CompanyRequest {
  id: number;
  companyName: string;
  status: string;
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

  const handleAction = async (id: number, status: 'approved' | 'rejected') => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    setActionError(prev => ({ ...prev, [id]: null }));
    
    try {
      const response = await fetch(`/api/admin/company-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      // Update the request status in the local state on success
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === id ? { ...req, status: status } : req
        )
      );

    } catch (err) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} request:`, err);
      setActionError(prev => ({ ...prev, [id]: err instanceof Error ? err.message : 'Failed to update status' }));
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin: Company Requests</h1>

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
                  Status: <span className={`font-medium ${request.status === 'pending' ? 'text-yellow-600' : request.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>{request.status}</span>
                </p>
                {actionError[request.id] && (
                    <p className="text-xs text-destructive mt-1">Error: {actionError[request.id]}</p>
                )}
              </div>
              {request.status === 'pending' && (
                <div className="flex flex-shrink-0 space-x-2">
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={() => handleAction(request.id, 'approved')}
                    disabled={actionLoading[request.id]}
                  >
                    {actionLoading[request.id] ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button 
                    variant="destructive"
                    size="sm" 
                    onClick={() => handleAction(request.id, 'rejected')}
                    disabled={actionLoading[request.id]}
                  >
                    {actionLoading[request.id] ? 'Processing...' : 'Reject'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 