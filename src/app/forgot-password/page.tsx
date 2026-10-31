"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Failed to send reset link");
      }

      toast.success("If the email exists, a reset link has been sent.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold">Forgot Password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {sent && <p className="text-sm text-yellow-700 dark:text-yellow-900">
            Check your email for a reset link (or see server logs in dev mode).
          </p>}

          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you a link to reset it. Links are valid for 30 minutes.
        </p>
      </Card>
    </div>
  );
}
