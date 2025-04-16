'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RequestCompanyPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (!companyName.trim()) {
        setError('Please enter a company name.');
        setIsLoading(false);
        return;
    }

    try {
      // Call the new API endpoint
      const response = await fetch('/api/company-requests', { 
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
            // Authorization headers (like JWT) are usually handled by the browser via cookies (httpOnly)
        },
        body: JSON.stringify({ companyName: companyName.trim() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Company request submitted successfully! Thank you.');
        setCompanyName(''); // Clear the form
        // Optional: Redirect or show other UI feedback
        // router.push('/dashboard'); 
      } else {
        // Handle API errors (including 400, 401, 500)
        setError(data.error || `Failed to submit request (Status: ${response.status})`);
      }
    } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Submit request error:', err);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Request a Company</h1>
        
        {message && (
          <div className="mb-4 p-3 bg-green-600/10 border border-green-600/20 rounded-md text-green-700 dark:text-green-400 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium mb-1">
              Company Name
            </label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full"
              required
              placeholder="Enter the company name"
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </div>
    </div>
  );
} 