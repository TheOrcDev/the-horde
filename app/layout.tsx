import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import SiteHeader from "@/components/site-header";
import SponsorRails from "@/components/sponsor-rails";
import { isAuthConfigured } from "@/lib/auth-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Horde",
  description: "Wanted posters for people who ship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
      >
        <SponsorRails>
          <SiteHeader configured={isAuthConfigured()} />
          {children}
        </SponsorRails>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
