'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <Button
        onClick={reset}
        variant="outline"
        className="px-4 py-2"
      >
        Try again
      </Button>
    </div>
  );
} 