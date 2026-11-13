import { PageHeader } from "@/components/admin/PageHeader";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { listMedia } from "@/admin/actions/media";

export const metadata = { title: "Media Library" };

export default async function MediaPage() {
  const r = await listMedia(0);
  return (
    <>
      <PageHeader eyebrow="Site" title="Media Library" description="Every image used on the website lives here. Upload once, then choose the same picture in any section. An image that is still in use cannot be deleted, but you can replace its file and every place that uses it updates." />
      {r.ok ? (
        <MediaLibrary initial={r.items} total={r.total} pageSize={r.pageSize} />
      ) : (
        <p role="alert" className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
          {r.error}
        </p>
      )}
    </>
  );
}
