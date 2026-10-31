"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const RULES = [
  { key: "length", label: "At least 9 characters" },
  { key: "uppercase", label: "Contains an uppercase letter" },
  { key: "lowercase", label: "Contains a lowercase letter" },
  { key: "special", label: "Contains a special character" },
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [showStrength, setShowStrength] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getChecklist(): Record<string, boolean> {
    return {
      length: password.length >= 9,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShowStrength(true);
    await new Promise((r) => setTimeout(r, 150));
    setShowStrength(false);

    const userInfo = getChecklist();
    const allPass = RULES.every((rule) => userInfo[rule.key]);
    if (!allPass) return;

    setChecking(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), name: name || undefined, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Signup failed");
      }

      toast.success("Account created!");
      window.location.href = "/login";
    } catch (e: any) {
      setError(e.message || "Signup failed");
    } finally {
      setChecking(false);
    }
  }

  const checklist = getChecklist();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <Link href="/" className="text-sm text-muted-foreground">← Back to home</Link>
        <h1 className="text-2xl font-bold">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <button
                type="button"
                onClick={() => setShowStrength(!showStrength)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showStrength ? "▲" : "▼"}
              </button>
            </div>

            {showStrength && (
              <div className="mt-2 space-y-1">
                {RULES.map((rule) => (
                  <label key={rule.key} className="block text-sm flex items-center gap-2">
                    <span>{checklist[rule.key] ? "✓" : "○"}</span>
                    <span>{rule.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={checking}>
            {checking ? "Creating..." : "Sign Up"}
          </Button>
        </form>

        <div className="pt-2 border-t text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:underline">Login here</Link>
        </div>
      </Card>
    </div>
  );
}
