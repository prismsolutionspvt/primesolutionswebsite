import { PageHeader, Block } from "@/components/admin/PageHeader";
import { CopyForm, ListManager } from "@/components/admin/ModuleSections";

export const metadata = { title: "FAQs" };

export default function FAQsPage() {
  return (
    <>
      <PageHeader title="FAQs" description="Edit the section text, then manage the items below. Changes go live on the website as soon as you save." />
      <Block>
        <CopyForm id="faqCopy" title="Section heading" description="The heading above the questions." />
      </Block>
      <ListManager id="faqs" />
    </>
  );
}
