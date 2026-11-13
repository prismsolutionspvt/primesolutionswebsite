import { PageHeader, Block } from "@/components/admin/PageHeader";
import { CopyForm, ListManager } from "@/components/admin/ModuleSections";

export const metadata = { title: "Team Management" };

export default function TeamManagementPage() {
  return (
    <>
      <PageHeader title="Team Management" description="Edit the section text, then manage the items below. Changes go live on the website as soon as you save." />
      <Block>
        <CopyForm id="teamCopy" title="Section heading" description="The heading and introduction of “Meet the People Behind Prism”." />
      </Block>
      <ListManager id="team" />
    </>
  );
}
