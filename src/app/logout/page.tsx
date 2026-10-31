"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";

export default function LogoutPage() {
  useEffect(() => {
    fetch("/api/auth/logout", { method: "POST" })
      .finally(() => {
        window.location.href = "/login";
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="max-w-md p-8 space-y-4 text-center">
        <h1 className="text-xl font-semibold">Signing out...</h1>
        <p className="text-sm text-muted-foreground">Redirecting to login.</p>
      </Card>
    </div>
  );
}
