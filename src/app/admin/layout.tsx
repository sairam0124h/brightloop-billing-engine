"use client";

import { Sidebar } from "@/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin</h1>
          <nav className="text-sm text-muted-foreground">
            <a href="/logout" className="hover:text-foreground">Log out</a>
          </nav>
        </div>
      </header>
      <div className="max-w-6xl mx-auto flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
