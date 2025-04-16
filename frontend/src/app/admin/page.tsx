'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyRequestsTable } from '@/components/admin/CompanyRequestsTable';
import { UsersTable } from '@/components/admin/UsersTable';
import { CompaniesTable } from '@/components/admin/CompaniesTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/reference">Quick Reference</Link>
        </Button>
      </div>
      
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Company Requests</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Company Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyRequestsTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <CompaniesTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 