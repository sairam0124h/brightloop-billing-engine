"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setDevResetLink(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const body = await res.json();
      setSubmitted(true);

      if (body.data?.devResetLink) {
        setDevResetLink(body.data.devResetLink);
      }

      toast.success("If an account exists, a reset link has been dispatched.");
    } catch {
      toast.error("Failed to request password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to login
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email address and we will send you a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending link..." : "Send Reset Link"}
          </Button>
        </form>

        {submitted && (
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border rounded-md text-sm text-muted-foreground">
            If an account with that email exists, we have sent instructions to reset your password. Links expire in 30 minutes.
          </div>
        )}

        {devResetLink && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md text-xs space-y-1">
            <div className="font-semibold text-amber-800 dark:text-amber-300">Development mode link:</div>
            <a
              href={devResetLink}
              className="text-amber-700 dark:text-amber-400 underline break-all font-mono"
            >
              {devResetLink}
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}
