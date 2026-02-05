"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql/client";
import { CustomerCreateDocument } from "@/generated/graphql";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Zod validation schema for registration form
const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  acceptsMarketing: z.boolean().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

/**
 * RegisterForm - Reusable registration form component with Zod validation
 * 
 * Validates user input before submission and displays field-level errors
 */
export function RegisterForm({ onSuccess, redirectTo = "/account" }: RegisterFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [acceptsMarketing, setAcceptsMarketing] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const client = getGraphQLClient();

  const registerMutation = useMutation({
    mutationFn: async (input: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      acceptsMarketing: boolean;
    }) => {
      return client.request(CustomerCreateDocument, { input });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Validate form data with Zod
    const result = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      acceptsMarketing,
    });

    if (!result.success) {
      // Extract field-level errors from Zod validation
      const errors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as keyof RegisterFormData] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    try {
      const mutationResult = await registerMutation.mutateAsync({
        email,
        password,
        firstName,
        lastName,
        acceptsMarketing,
      });

      // Check for user errors first
      const userErrors = mutationResult?.customerCreate?.userErrors || 
                        mutationResult?.customerCreate?.customerUserErrors || [];
      
      if (userErrors.length > 0) {
        setError(userErrors[0].message || "Registration failed");
        return;
      }

      if (mutationResult?.customerCreate?.customer) {
        // Registration successful - token is already in the response
        const accessToken = mutationResult?.customerCreate?.customerAccessToken?.accessToken;
        
        if (accessToken) {
          // Store token in httpOnly cookie via API route
          const tokenResponse = await fetch("/api/auth/set-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: accessToken }),
          });

          if (tokenResponse.ok) {
            if (onSuccess) {
              onSuccess();
            } else {
              router.push(redirectTo);
            }
          } else {
            setError("Registration successful but session setup failed. Please try logging in.");
          }
        } else {
          // No token in response - redirect to login
          setError("Registration successful! Please log in with your credentials.");
          setTimeout(() => router.push("/auth/login"), 2000);
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="firstName"
            className="text-sm font-medium text-foreground"
          >
            First Name
          </label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
            autoComplete="given-name"
            aria-invalid={!!fieldErrors.firstName}
            aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
          />
          {fieldErrors.firstName && (
            <p id="firstName-error" className="text-xs text-destructive">
              {fieldErrors.firstName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="lastName"
            className="text-sm font-medium text-foreground"
          >
            Last Name
          </label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
            autoComplete="family-name"
            aria-invalid={!!fieldErrors.lastName}
            aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
          />
          {fieldErrors.lastName && (
            <p id="lastName-error" className="text-xs text-destructive">
              {fieldErrors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-foreground"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        {fieldErrors.email && (
          <p id="email-error" className="text-xs text-destructive">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          autoComplete="new-password"
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
        />
        {fieldErrors.password ? (
          <p id="password-error" className="text-xs text-destructive">
            {fieldErrors.password}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <input
          id="acceptsMarketing"
          type="checkbox"
          checked={acceptsMarketing}
          onChange={(e) => setAcceptsMarketing(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        <label
          htmlFor="acceptsMarketing"
          className="text-sm text-muted-foreground"
        >
          I want to receive emails about products, promotions, and special offers
        </label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? "Creating account..." : "Create Account"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}
