import { PageHeader, Block } from "@/components/admin/PageHeader";
import { CopyForm, ListManager } from "@/components/admin/ModuleSections";

export const metadata = { title: "Our Approach" };

export default function OurApproachPage() {
  return (
    <>
      <PageHeader title="Our Approach" description="Edit the section text, then manage the items below. Changes go live on the website as soon as you save." />
      <Block>
        <CopyForm id="approachCopy" title="Section heading" description="The heading and introduction of “How we work”." />
      </Block>
      <ListManager id="approach" />
    </>
  );
}
