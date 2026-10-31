"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  mustResetPassword: boolean;
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
  const [fetching, setFetching] = useState(true);

  async function loadStaff() {
    try {
      const res = await fetch("/api/staff");
      if (res.status === 403) {
        window.location.href = "/admin";
        return;
      }
      if (res.ok) {
        const body = await res.json();
        setStaff(body.data?.staff || []);
      }
    } catch {
      // Ignored in initial load
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || undefined,
          password: password || undefined,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Only administrators can add staff members.");
        }
        throw new Error(body.error?.message || "Failed to create staff member");
      }

      setTemporaryPassword(body.data?.temporaryPassword || null);
      setEmail("");
      setName("");
      setPassword("");
      toast.success("Staff member created successfully!");
      await loadStaff();
    } catch (err: any) {
      setError(err.message || "Failed to create staff member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add team members with staff access. Only administrators can perform this action.
        </p>
      </div>

      {temporaryPassword && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-900 dark:text-amber-200">
              Temporary Password Generated (shown once):
            </span>
            <button
              onClick={() => setTemporaryPassword(null)}
              className="text-xs text-amber-700 dark:text-amber-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
          <div className="p-2 bg-white dark:bg-black rounded border font-mono text-sm break-all font-bold text-amber-900 dark:text-amber-100">
            {temporaryPassword}
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Share this temporary password with the staff member. They will be required to reset it upon login.
          </p>
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Staff Member</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="staffEmail">Email Address</Label>
            <Input
              id="staffEmail"
              type="email"
              required
              placeholder="colleague@brightloop.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staffName">Full Name (optional)</Label>
            <Input
              id="staffName"
              placeholder="Alex Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staffPassword">Temporary Password (optional)</Label>
            <Input
              id="staffPassword"
              type="password"
              placeholder="Leave blank to auto-generate"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="md:col-span-3 text-sm text-destructive font-medium">{error}</div>
          )}

          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Staff Account"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Current Staff Members</h2>
        {fetching ? (
          <div className="text-sm text-muted-foreground py-4">Loading staff members...</div>
        ) : staff.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">No staff members created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Password Reset Status</th>
                  <th className="pb-3 font-medium">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/50">
                    <td className="py-3 font-medium">{member.name || "—"}</td>
                    <td className="py-3 font-mono text-xs">{member.email}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3">
                      {member.mustResetPassword ? (
                        <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">
                          Must Reset Password
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
