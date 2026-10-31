"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function LogoutPage() {
  useEffect(() => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="max-w-md p-8 space-y-4">
        <h1 className="text-2xl font-bold">Logging out...</h1>
        <Link href="/" className="text-muted-foreground hover:text-foreground">Continue to home</Link>
      </Card>
    </div>
  );
}
