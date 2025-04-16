'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <Button
            onClick={() => reset()}
            variant="outline"
            className="px-4 py-2"
          >
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
} 