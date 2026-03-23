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
  title: {
    default: "CheckBeforeCommit | AI-Powered Architectural Governance & Remediation",
    template: "%s | CheckBeforeCommit"
  },
  description: "Transform your engineering with Remediation-as-Code. Automate architectural governance, resolve technical debt with AI, and visualize codebase health trends in real-time.",
  keywords: [
    "AI Code Analysis", 
    "Architectural Governance", 
    "Remediation-as-Code", 
    "Technical Debt Management", 
    "Codebase Health Visualization", 
    "GitLab Architecture Analysis", 
    "GitHub App PR Governance",
    "Auto-Remediation PRs",
    "Enterprise Technical Debt",
    "Dependency Blast Radius"
  ],
  authors: [{ name: "CheckBeforeCommit" }],
  creator: "CheckBeforeCommit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "CheckBeforeCommit | AI-Powered Architectural Governance & Remediation",
    description: "Automate architectural governance and technical debt remediation. Get the 'Magic Fix' for your codebase today.",
    siteName: "CheckBeforeCommit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CheckBeforeCommit AI Architectural Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CheckBeforeCommit | AI-Powered Architectural Governance",
    description: "Automate architectural governance and resolve technical debt with AI. The future of code quality is here.",
    images: ["/og-image.png"],
    creator: "@CheckBeforeCommit",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CheckBeforeCommit",
  "url": process.env.NEXT_PUBLIC_APP_URL || "https://checkbeforecommit.vercel.app",
  "logo": `${process.env.NEXT_PUBLIC_APP_URL || 'https://checkbeforecommit.vercel.app'}/favicon.svg`,
  "description": "AI-powered architectural governance and remediation platform for modern engineering teams.",
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "teamintrasphere@gmail.com",
    "contactType": "customer support"
  }
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "CheckBeforeCommit",
  "url": process.env.NEXT_PUBLIC_APP_URL || "https://checkbeforecommit.vercel.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${process.env.NEXT_PUBLIC_APP_URL || 'https://checkbeforecommit.vercel.app'}/dashboard?url={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
