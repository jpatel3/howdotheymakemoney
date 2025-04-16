'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ReferencePage() {
  const frontendUrls = [
    { path: '/', description: 'Homepage' },
    { path: '/companies', description: 'Browse all companies' },
    { path: '/companies/[id]', description: 'View specific company details' },
    { path: '/request', description: 'Request a new company analysis' },
    { path: '/bookmarks', description: 'View your bookmarked companies' },
    { path: '/profile', description: 'User profile and settings' },
  ];

  const adminUrls = [
    { path: '/admin', description: 'Admin Dashboard' },
    { path: '/admin/company-requests', description: 'Manage company requests' },
    { path: '/admin/users', description: 'Manage users' },
    { path: '/admin/companies', description: 'Manage companies' },
    { path: '/admin/reference', description: 'This reference page' },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Quick Reference</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Frontend URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {frontendUrls.map((url) => (
                <div key={url.path} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{url.path}</p>
                    <p className="text-sm text-gray-500">{url.description}</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={url.path}>Visit</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adminUrls.map((url) => (
                <div key={url.path} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{url.path}</p>
                    <p className="text-sm text-gray-500">{url.description}</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={url.path}>Visit</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 