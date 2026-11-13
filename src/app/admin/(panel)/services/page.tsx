import { PageHeader, Block } from "@/components/admin/PageHeader";
import { CopyForm, ListManager } from "@/components/admin/ModuleSections";

export const metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <>
      <PageHeader title="Services" description="Edit the section text, then manage the items below. Changes go live on the website as soon as you save." />
      <Block>
        <CopyForm id="servicesCopy" title="Section heading" description="The heading and introduction above the services." />
      </Block>
      <ListManager id="services" />
    </>
  );
}
