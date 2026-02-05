"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Sign In</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <Suspense fallback={<Spinner />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
