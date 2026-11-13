import { PageHeader, Block } from "@/components/admin/PageHeader";
import { CopyForm } from "@/components/admin/ModuleSections";

export const metadata = { title: "Mission & Vision" };

export default function MissionVisionPage() {
  return (
    <>
      <PageHeader title="Mission & Vision" description="Two statements, each shown as its own full-screen scene on the website." />
      <Block><CopyForm id="missionVision" title="Mission & vision" /></Block>
    </>
  );
}
