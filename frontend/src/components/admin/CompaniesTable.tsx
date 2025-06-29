'use client';

import { useEffect, useState, Fragment } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Define the shape of the company data we expect from the API
interface Company {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  // Add other fields if needed from the API response
}

export function CompaniesTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/companies');
      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }
      const data: Company[] = await response.json();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error("Error fetching companies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async (slug: string) => {
    setIsDeleting(companies.find(c => c.slug === slug)?.id ?? null);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/admin/companies/${slug}`, {
        method: 'DELETE',
        headers: {
          // Add authentication headers if needed
        }
      });
      if (response.status === 204) {
        setCompanies(prevCompanies => prevCompanies.filter(c => c.slug !== slug));
        console.log(`Company ${slug} deleted successfully.`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete company (status: ${response.status})`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred during deletion';
      setDeleteError(errorMsg);
      console.error(`Error deleting company ${slug}:`, err);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading companies...</span>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Companies</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Fragment>
      {deleteError && (
         <Alert variant="destructive" className="mb-4">
           <AlertTitle>Delete Error</AlertTitle>
           <AlertDescription>{deleteError}</AlertDescription>
         </Alert>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description (Snippet)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No companies found.
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.slug}</TableCell>
                  <TableCell className="max-w-xs truncate">{company.description ?? 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                       <Link href={`/company/${company.slug}`} target="_blank">View <ExternalLink className="ml-1 h-3 w-3"/></Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          disabled={isDeleting === company.id}
                        >
                          {isDeleting === company.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            company "{company.name}" and all associated data (bookmarks, comments, etc. - IF NOT CASCADED).
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(company.slug)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Fragment>
  );
} 