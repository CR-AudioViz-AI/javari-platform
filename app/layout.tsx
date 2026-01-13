import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Javari AI Platform",
  description: "Unified capability-first platform for content creation, business tools, and collection management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
