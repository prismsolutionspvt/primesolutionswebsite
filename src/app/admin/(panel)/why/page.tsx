import { PageHeader, Block } from "@/components/admin/PageHeader";
import { CopyForm, ListManager } from "@/components/admin/ModuleSections";

export const metadata = { title: "Why Prism" };

export default function WhyPrismPage() {
  return (
    <>
      <PageHeader title="Why Prism" description="Edit the section text, then manage the items below. Changes go live on the website as soon as you save." />
      <Block>
        <CopyForm id="whyCopy" title="Section heading" description="The heading above the animated ring." />
      </Block>
      <ListManager id="why" />
    </>
  );
}
