"use client";
import { useCallback, useRef, useState } from "react";
import { ImagePlus, Info, Loader2, Pencil, Repeat2, Trash2, UploadCloud } from "lucide-react";
import { deleteMedia, listMedia, mediaUsageOf, updateMediaAlt, uploadMedia, type MediaItem } from "@/admin/actions/media";
import type { MediaFolder } from "@/admin/fields";
import { CopyButton } from "@/components/ui/CopyButton";
import { useAdmin } from "./AdminProviders";

const FOLDERS: { id: MediaFolder; label: string }[] = [
  { id: "logos", label: "Logos" },
  { id: "team", label: "Team" },
  { id: "services", label: "Services" },
  { id: "industries", label: "Industries" },
  { id: "testimonials", label: "Testimonials" },
  { id: "announcements", label: "Announcements" },
  { id: "website", label: "Website" },
];
const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** Upload, browse, describe, replace and (when unused) delete the images used across the website. */
export function MediaLibrary({ initial, total: initialTotal }: { initial: MediaItem[]; total: number; pageSize?: number }) {
  const { toast, confirm } = useAdmin();
  const [items, setItems] = useState(initial);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<MediaFolder | "">("");
  const [folder, setFolder] = useState<MediaFolder>("website");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [editAlt, setEditAlt] = useState<{ id: string; value: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceId = useRef<string>("");

  const load = useCallback(
    async (p: number, f: MediaFolder | "", replace: boolean) => {
      setBusy(true);
      const r = await listMedia(p, f || undefined);
      setBusy(false);
      if (!r.ok) return toast("error", r.error);
      setPage(p);
      setTotal(r.total);
      setItems((cur) => (replace ? r.items : [...cur, ...r.items]));
    },
    [toast],
  );

  const send = async (file: File | undefined, replacing?: string) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast("error", "That image is larger than 5 MB.");
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", folder);
    if (replacing) fd.set("replaceId", replacing);
    const r = await uploadMedia(fd);
    setUploading(false);
    if (!r.ok) return toast("error", r.error);
    toast("ok", replacing ? "Image replaced. It updates everywhere it is used." : "Image uploaded.");
    load(0, filter, true);
  };

  const remove = async (m: MediaItem) => {
    const u = await mediaUsageOf(m.path);
    if (u.ok && u.used.length) return toast("error", `“${m.filename}” is in use (${u.used.join(", ")}) and cannot be deleted. Use “Replace” to swap the file instead.`);
    if (!(await confirm({ title: "Delete this image?", body: <>“{m.filename}” will be permanently deleted from the library.</>, confirmLabel: "Delete", danger: true }))) return;
    const r = await deleteMedia(m.id);
    if (!r.ok) return toast("error", r.error);
    toast("ok", "Image deleted.");
    setItems((cur) => cur.filter((x) => x.id !== m.id));
    setTotal((t) => t - 1);
  };

  const saveAlt = async () => {
    if (!editAlt) return;
    const r = await updateMediaAlt(editAlt.id, editAlt.value);
    if (!r.ok) return toast("error", r.error);
    setItems((cur) => cur.map((x) => (x.id === editAlt.id ? { ...x, alt: editAlt.value.trim() } : x)));
    setEditAlt(null);
    toast("ok", "Description saved.");
  };

  return (
    <div>
      <div
        onDragOver={(e) => (e.preventDefault(), setDrag(true))}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => (e.preventDefault(), setDrag(false), send(e.dataTransfer.files[0]))}
        className={`flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed p-8 text-center transition ${drag ? "border-accent bg-accent/10" : "border-line bg-bg"}`}
      >
        {uploading ? <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden /> : <UploadCloud className="h-8 w-8 text-accent" aria-hidden />}
        <p className="font-semibold">{uploading ? "Uploading…" : "Drag an image here, or choose one"}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Save in</span>
            <select value={folder} onChange={(e) => setFolder(e.target.value as MediaFolder)} className="min-h-[44px] rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-accent">
              {FOLDERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" disabled={uploading} onClick={() => input.current?.click()} className="btn btn-primary !min-h-[44px]">
            <ImagePlus className="h-[18px] w-[18px]" aria-hidden /> Upload image
          </button>
        </div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/x-icon" className="sr-only" aria-label="Upload an image" onChange={(e) => (send(e.target.files?.[0]), (e.target.value = ""))} />
        <input ref={replaceInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/x-icon" className="sr-only" aria-label="Choose a replacement image" onChange={(e) => (send(e.target.files?.[0], replaceId.current), (e.target.value = ""))} />
        <p className="flex items-center gap-2 text-xs text-muted">
          <Info className="h-3.5 w-3.5" aria-hidden /> JPG, PNG, WebP, AVIF, GIF or ICO · up to 5 MB · checked on upload
        </p>
      </div>

      <div role="tablist" aria-label="Folders" className="mt-8 flex flex-wrap gap-2">
        {[{ id: "" as const, label: "All" }, ...FOLDERS].map((f) => (
          <button key={f.label} type="button" role="tab" aria-selected={filter === f.id} onClick={() => (setFilter(f.id), load(0, f.id, true))} className={`min-h-[40px] rounded-full px-4 text-sm font-semibold transition ${filter === f.id ? "bg-ink text-bg" : "border border-line text-muted hover:text-ink"}`}>
            {f.label}
          </button>
        ))}
        <span className="ml-auto self-center text-sm text-muted">{total} {total === 1 ? "image" : "images"}</span>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 rounded-3xl border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">No images here yet.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-2xl border border-line bg-bg">
              <div className="aspect-[4/3] bg-[repeating-conic-gradient(rgb(var(--line))_0_25%,transparent_0_50%)] [background-size:18px_18px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt || m.filename} loading="lazy" decoding="async" className="h-full w-full object-contain" />
              </div>
              <div className="p-4">
                <p className="truncate text-sm font-semibold" title={m.filename}>{m.filename}</p>
                <p className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                  {m.folder} · {kb(m.size)} · {new Date(m.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                </p>
                {editAlt?.id === m.id ? (
                  <div className="mt-3 flex gap-2">
                    <input autoFocus aria-label="Image description" value={editAlt.value} maxLength={200} onChange={(e) => setEditAlt({ id: m.id, value: e.target.value })} onKeyDown={(e) => e.key === "Enter" && saveAlt()} placeholder="Describe the image" className="min-h-[40px] min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-accent" />
                    <button type="button" onClick={saveAlt} className="btn btn-primary !min-h-[40px] !px-4 text-sm">Save</button>
                  </div>
                ) : (
                  <p className="mt-2 line-clamp-1 text-sm text-muted">{m.alt || "No description (add one for accessibility)"}</p>
                )}
                <div className="mt-3 flex items-center gap-1.5">
                  <CopyButton value={m.url} label="image address" />
                  <button type="button" aria-label={`Edit description of ${m.filename}`} onClick={() => setEditAlt({ id: m.id, value: m.alt })} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:border-accent hover:text-ink"><Pencil className="h-4 w-4" /></button>
                  <button type="button" aria-label={`Replace ${m.filename}`} title="Replace the file (keeps the same address)" onClick={() => ((replaceId.current = m.id), replaceInput.current?.click())} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:border-accent hover:text-ink"><Repeat2 className="h-4 w-4" /></button>
                  <button type="button" aria-label={`Delete ${m.filename}`} onClick={() => remove(m)} className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:border-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {items.length < total && (
        <div className="mt-8 text-center">
          <button type="button" disabled={busy} onClick={() => load(page + 1, filter, false)} className="btn btn-ghost !min-h-[44px]">
            {busy ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
