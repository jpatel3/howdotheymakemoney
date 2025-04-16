import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-4">Could not find requested resource</p>
      <Button asChild variant="outline">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
} 