import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://checkbeforecommit.vercel.app'),
  title: "CheckBeforeCommit - Code Architecture Analysis",
  description: "Understand any codebase in minutes. Get instant clarity on system architecture, complexity hot-spots, and integration risks.",
  keywords: ["code analysis", "github analysis", "software architecture", "technical debt", "repo overview", "developer productivity"],
  authors: [{ name: "CheckBeforeCommit Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "CheckBeforeCommit - Code Architecture Analysis",
    description: "Understand any codebase in minutes. Get instant clarity on system architecture, complexity hot-spots, and integration risks.",
    siteName: "CheckBeforeCommit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CheckBeforeCommit - Understand Codebases Instantly",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CheckBeforeCommit - Code Architecture Analysis",
    description: "Understand any codebase in minutes. Get instant clarity on system architecture, complexity hot-spots, and integration risks.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
