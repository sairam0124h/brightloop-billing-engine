"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 9 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError("Password does not meet requirements");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Reset failed");
      }

      toast.success("Password reset! Please log in with your new password.");
      window.location.href = "/login";
    } catch (e: any) {
      setError(e.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      window.location.href = "/forgot-password";
    }
  }, [token]);

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold">Reset Password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
