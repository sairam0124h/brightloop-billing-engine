"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface StaffMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadStaff() {
    const res = await fetch("/api/staff");
    if (res.ok) {
      const data = await res.json();
      setStaff(data.staff);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error?.code === "FORBIDDEN") {
          window.location.href = "/admin";
          return;
        }
        setError(err.error?.message || "Failed to create staff member");
        return;
      }

      const data = await res.json();
      setTemporaryPassword(data.temporaryPassword);
      setEmail("");
      setName("");
      setPassword("");
      await loadStaff();
    } catch {
      setError("Failed to create staff member");
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Staff Management</h1>

      <Card className="space-y-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Staff"}
            </Button>
          </div>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {temporaryPassword && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
            <p className="text-sm font-medium">Temporary password (shown once):</p>
            <code className="block text-sm mt-1 break-all">{temporaryPassword}</code>
            <p className="text-xs text-muted-foreground mt-2">User must reset password on next login.</p>
          </div>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left pb-3">Email</th>
                <th className="text-left pb-3">Name</th>
                <th className="text-left pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="py-3">{s.email}</td>
                  <td className="py-3">{s.name || "-"}</td>
                  <td className="py-3 text-sm text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
