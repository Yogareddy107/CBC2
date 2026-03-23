import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to CheckBeforeCommit to analyze GitHub and GitLab repositories, manage architectural governance, and track codebase health.",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
