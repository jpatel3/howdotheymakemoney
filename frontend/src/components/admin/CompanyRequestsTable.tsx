'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CompanyRequest {
  id: number;
  userId: number;
  companyName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export function CompanyRequestsTable() {
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/company-requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await fetch(`/api/admin/company-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company Name</TableHead>
          <TableHead>Requested By</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{request.companyName}</TableCell>
            <TableCell>
              <div>{request.user.name}</div>
              <div className="text-sm text-gray-500">{request.user.email}</div>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  request.status === 'approved'
                    ? 'success'
                    : request.status === 'rejected'
                    ? 'destructive'
                    : 'default'
                }
              >
                {request.status}
              </Badge>
            </TableCell>
            <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              {request.status === 'pending' && (
                <div className="space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(request.id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusChange(request.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 