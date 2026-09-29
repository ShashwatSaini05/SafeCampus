import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SafeCampus – Verified Anonymous Campus Safety Reporting",
  description:
    "Report campus safety incidents anonymously. Only verified COER University students can access. Your identity is fully protected.",
  keywords:
    "campus safety, anonymous reporting, ragging, harassment, COER University",
  openGraph: {
    title: "SafeCampus",
    description: "Verified Anonymous Campus Safety Reporting Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f8fafc] text-slate-800 antialiased overflow-x-hidden min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full" style={{ paddingTop: '85px' }}>{children}</main>
          <Footer />

        {/* Toasts */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#1e293b",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "14px 18px",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            },
            success: { iconTheme: { primary: "#16a34a", secondary: "#ffffff" } },
            error: { iconTheme: { primary: "#dc2626", secondary: "#ffffff" } },
          }}
        />
        </AuthProvider>
      </body>
    </html>
  );
}
