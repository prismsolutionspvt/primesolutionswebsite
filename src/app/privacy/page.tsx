import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <LegalShell title="Privacy Policy">
      <p>
        This page is a placeholder. Prism Solutions&apos; full privacy policy will be published here once it has been prepared and reviewed.
      </p>
      <p>
        Until then, please note that the enquiry form on this website is currently in preview mode: it validates what you type but does not store or transmit it. If you have questions about how your information will be handled, please contact us using the details on the homepage once they are available.
      </p>
    </LegalShell>
  );
}
