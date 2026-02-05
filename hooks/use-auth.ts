/**
 * Authentication Hook
 *
 * Provides login, logout, and authentication state management.
 *
 * Security Model:
 * 1. Login: Calls GraphQL mutation → Stores token in httpOnly cookie via API route
 * 2. Logout: Calls GraphQL mutation → Clears httpOnly cookie via API route
 * 3. Token validation: Happens on GraphQL backend (not client-side)
 *
 * Usage:
 * - Login/Register pages: Call login() after successful mutation
 * - Protected pages: Use AuthGuard component (checks cookie existence)
 * - Logout button: Call logout() to clear session
 *
 * @see lib/auth/cookies.ts - Cookie helper functions
 * @see lib/auth/routes.ts - Route configuration
 * @see proxy.ts - Server-side route protection
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { login, isLoading, error } = useAuth();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const result = await login(email, password);
 *     if (result.userErrors.length === 0) {
 *       // Success - redirected to /account
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql/client";
import {
  CustomerLoginDocument,
  CustomerLogoutDocument,
  CustomerTokenRenewDocument,
  type CustomerLoginMutation,
  type CustomerLogoutMutation,
  type CustomerTokenRenewMutation,
} from "@/generated/graphql";
import { setAuthToken, clearAuthToken, getAuthToken } from "@/lib/auth/cookies";
import { redirects } from "@/lib/auth/routes";

/**
 * Login input
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Login result
 */
export interface LoginResult {
  success: boolean;
  userErrors: Array<{ message: string; field?: string[] }>;
  accessToken?: string;
  expiresAt?: string;
}

/**
 * Logout result
 */
export interface LogoutResult {
  success: boolean;
  userErrors: Array<{ message: string; field?: string[] }>;
}

/**
 * Token renew result
 */
export interface TokenRenewResult {
  success: boolean;
  userErrors: Array<{ message: string; field?: string[] }>;
  accessToken?: string;
  expiresAt?: string;
}

/**
 * Authentication hook
 */
export function useAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const client = getGraphQLClient();

  const [error, setError] = useState<string | null>(null);

  /**
   * Login mutation
   */
  const loginMutation = useMutation({
    mutationFn: async (input: LoginInput): Promise<LoginResult> => {
      const data = await client.request<CustomerLoginMutation>(
        CustomerLoginDocument,
        { input }
      );

      const { customerAccessToken, userErrors } =
        data.customerAccessTokenCreate;

      if (userErrors && userErrors.length > 0) {
        return {
          success: false,
          userErrors: userErrors.map((e: any) => ({
            message: e.message,
            field: e.field || undefined,
          })),
        };
      }

      if (!customerAccessToken) {
        return {
          success: false,
          userErrors: [{ message: "Failed to create access token" }],
        };
      }

      // Store token in httpOnly cookie via API route
      await setAuthToken(customerAccessToken.accessToken);

      return {
        success: true,
        userErrors: [],
        accessToken: customerAccessToken.accessToken,
        expiresAt: customerAccessToken.expiresAt,
      };
    },
    onSuccess: (result: LoginResult) => {
      if (result.success) {
        // Clear any cached queries that might need authentication
        queryClient.invalidateQueries();

        // Redirect to original destination or account page
        const redirect = searchParams.get("redirect");
        router.push(redirect || redirects.authenticated);
      }
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Login failed");
    },
  });

  /**
   * Logout mutation
   */
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<LogoutResult> => {
      const token = getAuthToken();

      if (!token) {
        // No token to logout
        return {
          success: true,
          userErrors: [],
        };
      }

      const data = await client.request<CustomerLogoutMutation>(
        CustomerLogoutDocument,
        { customerAccessToken: token }
      );

      const { userErrors } = data.customerAccessTokenDelete;

      if (userErrors && userErrors.length > 0) {
        return {
          success: false,
          userErrors: userErrors.map((e: any) => ({
            message: e.message,
            field: e.field || undefined,
          })),
        };
      }

      // Clear httpOnly cookie via API route
      await clearAuthToken();

      return {
        success: true,
        userErrors: [],
      };
    },
    onSuccess: (result: LogoutResult) => {
      if (result.success) {
        // Clear all cached queries
        queryClient.clear();

        // Redirect to home page
        router.push("/");
      }
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Logout failed");
    },
  });

  /**
   * Token renew mutation
   */
  const renewTokenMutation = useMutation({
    mutationFn: async (): Promise<TokenRenewResult> => {
      const token = getAuthToken();

      if (!token) {
        return {
          success: false,
          userErrors: [{ message: "No token to renew" }],
        };
      }

      const data = await client.request<CustomerTokenRenewMutation>(
        CustomerTokenRenewDocument,
        { customerAccessToken: token }
      );

      const { customerAccessToken, userErrors } =
        data.customerAccessTokenRenew;

      if (userErrors && userErrors.length > 0) {
        return {
          success: false,
          userErrors: userErrors.map((e: any) => ({
            message: e.message,
            field: e.field || undefined,
          })),
        };
      }

      if (!customerAccessToken) {
        return {
          success: false,
          userErrors: [{ message: "Failed to renew access token" }],
        };
      }

      // Update token in httpOnly cookie via API route
      await setAuthToken(customerAccessToken.accessToken);

      return {
        success: true,
        userErrors: [],
        accessToken: customerAccessToken.accessToken,
        expiresAt: customerAccessToken.expiresAt,
      };
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Token renewal failed");
    },
  });

  /**
   * Login function
   */
  const login = async (email: string, password: string): Promise<LoginResult> => {
    setError(null);
    return loginMutation.mutateAsync({ email, password });
  };

  /**
   * Logout function
   */
  const logout = async (): Promise<LogoutResult> => {
    setError(null);
    return logoutMutation.mutateAsync();
  };

  /**
   * Renew token function
   */
  const renewToken = async (): Promise<TokenRenewResult> => {
    setError(null);
    return renewTokenMutation.mutateAsync();
  };

  return {
    // Functions
    login,
    logout,
    renewToken,

    // State
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRenewingToken: renewTokenMutation.isPending,
    isLoading:
      loginMutation.isPending ||
      logoutMutation.isPending ||
      renewTokenMutation.isPending,
    error,

    // Results
    loginResult: loginMutation.data,
    logoutResult: logoutMutation.data,
    renewResult: renewTokenMutation.data,
  };
}
