import { PageHeader, Block } from "@/components/admin/PageHeader";
import { CopyForm } from "@/components/admin/ModuleSections";
import { SectionToggles } from "@/components/admin/SectionToggles";
import { createServerSupabase } from "@/lib/supabase/server";
import { SECTION_TOGGLES } from "@/admin/registry";

export const metadata = { title: "Website Appearance" };

export default async function AppearancePage() {
  const sb = await createServerSupabase();
  const { data } = await sb.from("site_sections").select("key,is_visible");
  const visible = Object.fromEntries(SECTION_TOGGLES.map((s) => [s.key, data?.find((r) => r.key === s.key)?.is_visible !== false]));
  return (
    <>
      <PageHeader title="Website Appearance" description="Brand images, search and sharing details, the footer, the “Powered by” credit, the default theme and which sections are shown." />
      <div className="space-y-8">
        <Block><CopyForm id="brand" /></Block>
        <Block><CopyForm id="seo" /></Block>
        <Block><CopyForm id="footer" /></Block>
        <Block><CopyForm id="credit" /></Block>
        <Block><CopyForm id="theme" /></Block>
        <Block title="Show or hide sections" description="A hidden section disappears from the website; nothing is deleted.">
          <SectionToggles visible={visible} />
        </Block>
      </div>
    </>
  );
}
