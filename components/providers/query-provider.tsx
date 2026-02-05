'use client';

/**
 * QueryProvider - React Query client provider with enhanced error handling
 *
 * Configures React Query with optimal defaults for e-commerce:
 * - Stale time: 1 minute (data considered fresh)
 * - GC time: 5 minutes (cache cleanup)
 * - Query retry: 3 attempts with exponential backoff
 * - Mutation retry: 2 attempts with exponential backoff
 * - Global error handling with toast notifications
 *
 * Requirements: 11.1, 11.2, 11.4
 *
 * @module storefront-nextjs/components/providers/query-provider
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * GraphQL user error structure
 */
interface UserError {
  field?: string[] | null;
  message: string;
  code?: string | null;
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Extract user errors from GraphQL mutation response
 * Handles nested userErrors in various response shapes
 */
export function extractUserErrors(error: unknown): UserError[] {
  if (!error) return [];

  // Handle GraphQL response with userErrors field
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;

    // Direct userErrors array
    if (Array.isArray(obj.userErrors)) {
      return obj.userErrors as UserError[];
    }

    // Nested in data field (mutation response shape)
    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      for (const key of Object.keys(data)) {
        const mutation = data[key] as Record<string, unknown>;
        if (mutation?.userErrors && Array.isArray(mutation.userErrors)) {
          return mutation.userErrors as UserError[];
        }
      }
    }
  }

  return [];
}

/**
 * Map error codes to user-friendly messages
 */
function getErrorMessage(error: unknown): string {
  // Handle Error objects
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Nie można połączyć się z serwerem. Sprawdź połączenie internetowe.';
    }
    // Timeout errors
    if (error.message.includes('timeout')) {
      return 'Serwer nie odpowiada. Spróbuj ponownie za chwilę.';
    }
    return error.message;
  }

  // Handle HTTP response errors
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;

    // Rate limiting (429)
    if (obj.status === 429) {
      return 'Zbyt wiele żądań. Proszę poczekać chwilę.';
    }

    // Server errors (5xx)
    if (typeof obj.status === 'number' && obj.status >= 500) {
      return 'Wystąpił błąd serwera. Spróbuj ponownie później.';
    }

    // GraphQL errors
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      const graphqlError = obj.errors[0] as { message?: string };
      return graphqlError.message || 'Wystąpił błąd podczas przetwarzania żądania.';
    }
  }

  return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
}

/**
 * Check if error should trigger retry
 * Don't retry client errors (4xx except 429) or GraphQL validation errors
 */
function shouldRetry(failureCount: number, error: unknown, maxRetries: number): boolean {
  if (failureCount >= maxRetries) return false;

  // Always retry network errors
  if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
    return true;
  }

  // Check HTTP status
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;

    // Retry rate limiting after delay
    if (obj.status === 429) return true;

    // Retry server errors
    if (typeof obj.status === 'number' && obj.status >= 500) return true;

    // Don't retry client errors (except 429)
    if (typeof obj.status === 'number' && obj.status >= 400 && obj.status < 500) return false;

    // Don't retry GraphQL user errors (business logic errors)
    const userErrors = extractUserErrors(error);
    if (userErrors.length > 0) return false;
  }

  // Default: allow retry
  return true;
}

/**
 * Global mutation error handler
 * Shows toast notification for failed mutations
 */
function handleMutationError(error: unknown): void {
  const userErrors = extractUserErrors(error);

  if (userErrors.length > 0) {
    // Show first user error
    toast.error(userErrors[0].message);
  } else {
    // Show generic error message
    toast.error(getErrorMessage(error));
  }
}

/**
 * Global query error handler
 * Called after all retries are exhausted
 */
function handleQueryError(error: unknown): void {
  console.error('[Query Error]', error);

  // Only show toast for significant errors, not background refetches
  const message = getErrorMessage(error);
  if (message.includes('połączyć') || message.includes('serwera')) {
    toast.error(message, {
      action: {
        label: 'Odśwież',
        onClick: () => window.location.reload(),
      },
    });
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * QueryProvider - Wraps app with React Query client
 *
 * Creates a QueryClient instance with optimized defaults for e-commerce:
 * - Data is considered fresh for 1 minute (reduces unnecessary refetches)
 * - Cache is garbage collected after 5 minutes of inactivity
 * - Failed requests retry up to 3 times with exponential backoff
 * - Mutations retry up to 2 times
 * - Global error handlers show toast notifications
 *
 * Requirements: 11.1, 11.2, 11.4
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 1 minute
            staleTime: 60 * 1000,

            // Cache is garbage collected after 5 minutes of inactivity
            gcTime: 5 * 60 * 1000,

            // Retry failed requests up to 3 times
            retry: (failureCount, error) => shouldRetry(failureCount, error, 3),

            // Exponential backoff for retries: 1s, 2s, 4s (max 30s)
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Don't refetch on window focus (user-triggered actions only)
            refetchOnWindowFocus: false,

            // Don't refetch on mount if data is still fresh
            refetchOnMount: false,
          },
          mutations: {
            // Retry mutations up to 2 times for transient errors
            retry: (failureCount, error) => shouldRetry(failureCount, error, 2),

            // Faster backoff for mutations: 1s, 2s (max 10s)
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),

            // Global error handler for mutations
            onError: handleMutationError,
          },
        },
      })
  );

  // Set up global query error handler
  useState(() => {
    queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.state.status === 'error') {
        // Only trigger for queries that have exhausted retries
        const state = event.query.state;
        if (state.fetchFailureCount >= 3) {
          handleQueryError(state.error);
        }
      }
    });
    return undefined;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Export error utilities for use in components
export { getErrorMessage, handleMutationError };
