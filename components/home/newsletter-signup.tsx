"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NewsletterSignupProps {
  className?: string;
}

export function NewsletterSignup({ className }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement newsletter subscription API call
      // await subscribeToNewsletter(email);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      setEmail("");
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      setError("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={cn("container mx-auto px-4", className)}>
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 md:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          
          <h2 className="mb-2 text-3xl font-bold text-foreground">
            Stay in the Loop
          </h2>
          <p className="mb-6 text-muted-foreground">
            Subscribe to our newsletter for exclusive offers, new arrivals, and insider news.
          </p>

          {isSuccess ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-950 dark:text-green-400">
              <Check className="h-5 w-5" />
              <span className="font-medium">
                Thanks for subscribing! Check your email for confirmation.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto max-w-md">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                  required
                />
                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  size="lg"
                  className="sm:w-auto"
                >
                  {isLoading ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
              
              {error && (
                <p className="mt-2 text-sm text-destructive">{error}</p>
              )}
              
              <p className="mt-3 text-xs text-muted-foreground">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
