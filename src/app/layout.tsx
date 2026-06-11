import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrbitIQ",
  description:
    "Turn cloud consumption, customer health, and market signals into prioritized account-growth actions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
