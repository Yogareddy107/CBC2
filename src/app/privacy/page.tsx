import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how CheckBeforeCommit protects your data and privacy. Read our comprehensive privacy policy.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF6] text-[#1A1A1A]">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-[#1A1A1A]/5 h-16">
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-[#1A1A1A] hover:opacity-80 transition-opacity">
            <Compass className="text-[#FF7D29] w-6 h-6" />
            <span className="hidden sm:inline">Check<span className="text-[#FF7D29]">Before</span>Commit</span>
            <span className="sm:hidden text-[#FF7D29]">CBC</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-[#FF7D29] hover:text-[#FF7D29]/80 transition-colors">
            ← Back Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[900px] mx-auto px-6 py-16">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A] mb-4">Privacy Policy</h1>
          <p className="text-[#1A1A1A]/60 text-lg mb-12">Last updated: March 1, 2026</p>

          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">1. Introduction</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                CheckBeforeCommit ("we", "our", "us", or the "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">2. Information We Collect</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed mb-4">We prioritize your privacy by minimizing data collection. We collect:</p>
              <ul className="list-disc list-inside space-y-2 text-[#1A1A1A]/80">
                <li><strong>Account Information:</strong> Email address and GitHub/GitLab profile data via secure OAuth.</li>
                <li><strong>Access Tokens:</strong> Personal Access Tokens (PATs) for private repository analysis are stored securely using enterprise-grade encryption via Appwrite preferences and are never shared or exposed.</li>
                <li><strong>Usage Metadata:</strong> Basic telemetry to improve performance, including repository URLs and analysis timestamps.</li>
                <li><strong>Technical Data:</strong> IP address and browser type for security monitoring and fraud prevention.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">3. How We Use Your Information</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 text-[#1A1A1A]/80">
                <li>Provide and maintain our services</li>
                <li>Process your transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our website and services</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect, prevent, and address fraud and security issues</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">4. Information Sharing</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. However, we may share information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#1A1A1A]/80 mt-4">
                <li>Service providers who assist us in operating our website and conducting our business</li>
                <li>GitHub (for OAuth authentication purposes)</li>
                <li>Payment processors for transaction handling</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">5. Data Security & Zero-Storage Policy</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed mb-4">
                We implement a strict <strong>Zero-Storage Policy</strong> for your source code:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#1A1A1A]/80">
                <li><strong>Ephemeral Analysis:</strong> Your source code is analyzed in-memory during a secure session and is deleted immediately after the analysis report is generated.</li>
                <li><strong>No AI Training:</strong> We never use your private code to train AI models or contribute to any public datasets.</li>
                <li><strong>Encryption:</strong> All data in transit is protected by TLS 1.3 encryption, and sensitive tokens are encrypted at rest.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">6. Data Retention</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">7. Your Rights</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-[#1A1A1A]/80">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of certain communications</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">8. Contact Us</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:{' '}
                <a href="mailto:teamintrasphere@gmail.com" className="text-[#FF7D29] hover:underline">
                  teamintrasphere@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 px-6 mt-16">
        <div className="max-w-[900px] mx-auto text-center text-xs text-[#1A1A1A]/40">
          <p>&copy; 2026 Check<span className="text-[#FF7D29]">Before</span>Commit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
