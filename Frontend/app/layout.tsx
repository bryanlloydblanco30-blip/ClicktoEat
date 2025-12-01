'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { ToastProvider } from "./components/Toast";
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
  
  // Pages that should NOT show sidebar/navbar (auth pages)
  const authPages = ['/login', '/signup'];
  const isAuthPage = authPages.includes(pathname);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {isAuthPage ? (
            // Auth pages: clean layout
            children
          ) : (
            // Regular pages: with sidebar and navbar
            <section className="flex">
              <Sidebar />
              <div className="w-full">
                <Navbar />
                <main>
                  {children}
                </main>
              </div>
            </section>
          )}
        </ToastProvider>
      </body>
    </html>
  );
}