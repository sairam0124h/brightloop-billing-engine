"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || "Invalid email or password");
      }

      toast.success("Logged in successfully");
      const role = body.data?.user?.role;

      if (from && !from.startsWith("/login") && !from.startsWith("/signup")) {
        window.location.href = from;
      } else if (role === "ADMIN" || role === "STAFF") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/portal";
      }
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Enter your credentials to access your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-destructive font-medium">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground border-t pt-4">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Suspense fallback={<Card className="w-full max-w-md p-8">Loading...</Card>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
