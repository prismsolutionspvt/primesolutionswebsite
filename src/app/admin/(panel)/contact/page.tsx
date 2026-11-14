import { PageHeader, Block } from "@/components/admin/PageHeader";
import { CopyForm, ListManager } from "@/components/admin/ModuleSections";

export const metadata = { title: "Contact & Social" };

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact & Social Settings" description="One place for your email, phone, WhatsApp and social profiles. Whatever you save here updates the contact section, the footer, the WhatsApp button and the site’s search data." />
      <div className="space-y-8">
        <Block><CopyForm id="contact" /></Block>
        <Block><CopyForm id="whatsapp" /></Block>
        <Block><CopyForm id="instagram" /></Block>
        <Block><CopyForm id="footer" /></Block>
      </div>
      <ListManager id="social" title="Other social links" />
    </>
  );
}
