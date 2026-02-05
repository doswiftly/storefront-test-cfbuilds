'use client';

/**
 * Error Page - Global error handling for runtime errors
 *
 * Displays when an unhandled error occurs in the application.
 * Provides retry and navigation options.
 *
 * Requirements: 11.1
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Page]', error);
    }
    // TODO: Log error to error tracking service (e.g., Sentry)
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Wystąpił błąd</CardTitle>
          <CardDescription className="text-base">
            Przepraszamy, wystąpił nieoczekiwany problem. Spróbuj odświeżyć stronę lub wróć do strony głównej.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error details in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-md bg-muted p-3 text-left text-xs">
              <p className="font-medium text-destructive">{error.message}</p>
              {error.digest && (
                <p className="mt-1 text-muted-foreground">Digest: {error.digest}</p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button onClick={reset} className="w-full">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Spróbuj ponownie
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Strona główna
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Produkty
                </Link>
              </Button>
            </div>
          </div>

          {/* Help text */}
          <p className="text-sm text-muted-foreground">
            Jeśli problem się powtarza,{' '}
            <Link href="/contact" className="text-primary underline underline-offset-4">
              skontaktuj się z nami
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
