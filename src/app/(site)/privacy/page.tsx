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
        Until then, please note how this website handles what you send: the enquiry form saves your name, email address, company, phone number, chosen service and message so the Prism team can review and respond to your enquiry, and the review form saves your name, optional company, rating and review text, which is published only after the team approves it. No enquiry is shared on this website. If you have questions about how your information will be handled, please contact us using the details on the homepage.
      </p>
    </LegalShell>
  );
}
