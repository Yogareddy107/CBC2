import { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: "CheckBeforeCommit | AI-Powered Architectural Governance",
  description: "Understand any codebase in minutes. Automate architectural governance, resolve technical debt with AI, and visualize health trends.",
  openGraph: {
    title: "CheckBeforeCommit | AI-Powered Architectural Governance",
    description: "High-fidelity mental models of your code. Architecture mapping, risk analysis, and entry points for any repo.",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CheckBeforeCommit",
    "operatingSystem": "Web",
    "applicationCategory": "DeveloperApplication",
    "description": "AI-powered architectural governance and remediation platform for GitHub and GitLab repositories.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Auto-Remediation PRs",
      "Architectural Health Trending",
      "Multi-Source VCS Support",
      "Enterprise RBAC",
      "Automated Webhook Governance"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingClient />
    </>
  );
}
