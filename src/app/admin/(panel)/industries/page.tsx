import { PageHeader, Block } from "@/components/admin/PageHeader";
import { CopyForm, ListManager } from "@/components/admin/ModuleSections";

export const metadata = { title: "Industries" };

export default function IndustriesPage() {
  return (
    <>
      <PageHeader title="Industries" description="Edit the section text, then manage the items below. Changes go live on the website as soon as you save." />
      <Block>
        <CopyForm id="industriesCopy" title="Section heading" description="The heading, introduction and disclaimer of the industries section." />
      </Block>
      <ListManager id="industries" />
    </>
  );
}
