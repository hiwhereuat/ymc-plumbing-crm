import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YMC Plumbing Job Manager",
  description: "Lead-to-job workflow for YMC Plumbing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="bg-white shadow-sm p-4">
          <h1 className="text-xl font-bold text-blue-700">YMC Plumbing</h1>
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}