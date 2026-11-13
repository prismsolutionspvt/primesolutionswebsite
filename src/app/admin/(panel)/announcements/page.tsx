import { PageHeader } from "@/components/admin/PageHeader";
import { ListManager } from "@/components/admin/ModuleSections";

export const metadata = { title: "Announcements" };

export default function AnnouncementsPage() {
  return (
    <>
      <PageHeader title="Announcements" description="Publish a pop-up announcement on the website, with an optional image and button. You decide when it starts and ends, how often a visitor sees it, and whether they can close it." />
      <ListManager id="announcements" title="Your announcements" />
    </>
  );
}
