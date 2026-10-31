"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checklist = {
    length: password.length > 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const allRulesPassed =
    checklist.length && checklist.uppercase && checklist.lowercase && checklist.special;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!allRulesPassed) {
      setError("Please ensure your password satisfies all requirements below.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || undefined,
          password,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        if (res.status === 409 || body.error?.code === "CONFLICT") {
          throw new Error("An account with this email already exists. Please log in instead.");
        }
        throw new Error(body.error?.message || "Failed to create account");
      }

      toast.success("Account created successfully!");
      window.location.href = "/portal";
    } catch (e: any) {
      setError(e.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Get started with Brightloop subscription billing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name (optional)</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground rounded bg-zinc-50 dark:bg-zinc-900 p-3 border">
            <div className="font-medium text-foreground mb-1">Password requirements:</div>
            <div className={`flex items-center gap-1.5 ${checklist.length ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
              <span>{checklist.length ? "✓" : "•"}</span>
              <span>More than 8 characters (at least 9)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${checklist.uppercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
              <span>{checklist.uppercase ? "✓" : "•"}</span>
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${checklist.lowercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
              <span>{checklist.lowercase ? "✓" : "•"}</span>
              <span>At least one lowercase letter (a-z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${checklist.special ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
              <span>{checklist.special ? "✓" : "•"}</span>
              <span>At least one special character (!@#$%^&*)</span>
            </div>
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading || !allRulesPassed}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
}
