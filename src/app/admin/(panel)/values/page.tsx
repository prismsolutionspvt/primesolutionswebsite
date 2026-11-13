import { PageHeader, Block } from "@/components/admin/PageHeader";
import { CopyForm, ListManager } from "@/components/admin/ModuleSections";

export const metadata = { title: "Core Values" };

export default function CoreValuesPage() {
  return (
    <>
      <PageHeader title="Core Values" description="Edit the section text, then manage the items below. Changes go live on the website as soon as you save." />
      <Block>
        <CopyForm id="valuesCopy" title="Section heading" description="The heading above the values." />
      </Block>
      <ListManager id="values" />
    </>
  );
}
