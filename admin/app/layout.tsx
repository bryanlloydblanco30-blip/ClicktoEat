// admin/app/layout.tsx
'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Hide sidebar and navbar for /owner route (staff dashboard)
  const isOwnerPage = pathname === '/owner' || pathname?.startsWith('/owner?');

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isOwnerPage ? (
          // Staff dashboard - full width, no sidebar/navbar
          <main className="min-h-screen">
            {children}
          </main>
        ) : (
          // Admin dashboard - with sidebar and navbar
          <section className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col w-full min-w-0">
              <Navbar />
              <main className="flex-1 p-4 md:p-6 overflow-auto">
                {children}
              </main>
            </div>
          </section>
        )}
      </body>
    </html>
  );
}