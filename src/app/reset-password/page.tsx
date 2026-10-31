"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checklist = {
    length: password.length > 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!checklist.length || !checklist.uppercase || !checklist.lowercase || !checklist.special) {
      setError("Password does not meet all complexity requirements");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || "Failed to reset password");
      }

      toast.success("Password reset successfully. Please log in with your new password.");
      window.location.href = "/login";
    } catch (e: any) {
      setError(e.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="space-y-1 text-xs text-muted-foreground rounded bg-zinc-50 dark:bg-zinc-900 p-3 border">
          <div className="font-medium mb-1 text-foreground">Password requirements:</div>
          <div className={checklist.length ? "text-emerald-600 font-medium" : ""}>
            {checklist.length ? "✓" : "•"} More than 8 characters (at least 9)
          </div>
          <div className={checklist.uppercase ? "text-emerald-600 font-medium" : ""}>
            {checklist.uppercase ? "✓" : "•"} At least one uppercase letter
          </div>
          <div className={checklist.lowercase ? "text-emerald-600 font-medium" : ""}>
            {checklist.lowercase ? "✓" : "•"} At least one lowercase letter
          </div>
          <div className={checklist.special ? "text-emerald-600 font-medium" : ""}>
            {checklist.special ? "✓" : "•"} At least one special character
          </div>
        </div>

        {error && <p className="text-sm text-destructive font-medium">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      <div className="text-center">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Back to login
        </Link>
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Suspense fallback={<Card className="w-full max-w-md p-8">Loading...</Card>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
