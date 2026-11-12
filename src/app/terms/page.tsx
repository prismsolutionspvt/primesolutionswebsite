import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <LegalShell title="Terms">
      <p>
        This page is a placeholder. Prism Solutions&apos; terms of use will be published here once they have been prepared and reviewed.
      </p>
      <p>The information on this website is provided for general guidance about Prism Solutions&apos; services and does not constitute a contract or offer.</p>
    </LegalShell>
  );
}
