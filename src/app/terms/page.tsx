import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Terms of Service for CheckBeforeCommit, the AI-powered architectural governance platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A] mb-4">Terms of Service</h1>
          <p className="text-[#1A1A1A]/60 text-lg mb-12">Last updated: March 1, 2026</p>

          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">1. Agreement to Terms</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                By accessing and using CheckBeforeCommit's website and services, you accept and agree to be bound by and comply with these Terms of Service. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">2. Use License</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on CheckBeforeCommit's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#1A1A1A]/80">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">3. Disclaimer</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                The materials on CheckBeforeCommit's website are provided on an 'as is' basis. CheckBeforeCommit makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">4. Limitations</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                In no event shall CheckBeforeCommit or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CheckBeforeCommit's website, even if CheckBeforeCommit or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">5. Accuracy of Materials</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                The materials appearing on CheckBeforeCommit's website could include technical, typographical, or photographic errors. CheckBeforeCommit does not warrant that any of the materials in its website are accurate, complete, or current. CheckBeforeCommit may make changes to the materials contained on its website at any time without notice.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">6. Links</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                CheckBeforeCommit has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by CheckBeforeCommit of the site. Use of any such linked website is at the user's own risk.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">7. Modifications</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                CheckBeforeCommit may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms of Service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">8. Governing Law</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">9. Data Security & Privacy</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                CheckBeforeCommit is designed with a <strong>Privacy-First</strong> architecture. By using our service, you acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#1A1A1A]/80 mt-4">
                <li>Analyzed source code is processed in-memory and is never stored on our servers.</li>
                <li>Your Personal Access Tokens (PATs) are encrypted at rest and only used to facilitate the requested analysis.</li>
                <li>We do not use your private code for AI model training or data mining.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">10. User Responsibilities</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed mb-4">As a user of CheckBeforeCommit, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-[#1A1A1A]/80">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Not use the service for illegal or unauthorized purposes</li>
                <li>Not transmit viruses or malicious code</li>
                <li>Respect intellectual property rights of others</li>
              </ul>
            </div>

            <p className="text-[#1A1A1A]/80 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:{' '}
              <a href="mailto:teamintrasphere@gmail.com" className="text-[#FF7D29] hover:underline">
                teamintrasphere@gmail.com
              </a>
            </p>
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
