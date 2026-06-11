import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OCI FinOps Rescue Room",
  description:
    "Turn rough OCI cost and resource signals into a customer-ready optimization plan.",
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
