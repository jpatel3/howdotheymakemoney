'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // For admin status
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';

// Define the shape of the user data we expect from the API
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string; // Assuming API returns date as string
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Assume an API endpoint exists to fetch all users (requires admin auth)
      const response = await fetch('/api/admin/users'); 
      if (!response.ok) {
        // Attempt to get error message from response body
        let errorMsg = `Failed to fetch users: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Users</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created At</TableHead>
            {/* <TableHead className="text-right">Actions</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.isAdmin ? (
                    <Badge variant="destructive">Admin</Badge>
                  ) : (
                    <Badge variant="secondary">User</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()} {/* Format date */}
                </TableCell>
                {/* <TableCell className="text-right"> */}
                  {/* Placeholder for Actions (e.g., Edit role, Delete user) */}
                {/* </TableCell> */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 