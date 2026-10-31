import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brightloop Billing Engine",
  description: "Subscription billing engine for Brightloop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
