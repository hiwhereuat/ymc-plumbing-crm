import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YMC Plumbing",
  description: "Lead-to-job workflow for YMC Plumbing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
        <header style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}>
          <div style={{
            maxWidth: "1024px",
            margin: "0 auto",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <h1 style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "#2563eb",
            }}>
              YMC Plumbing
            </h1>
            <span style={{
              fontSize: "0.75rem",
              color: "#94a3b8",
            }}>
              Job Manager
            </span>
          </div>
        </header>
        <main style={{ padding: "1rem" }}>{children}</main>
      </body>
    </html>
  );
}