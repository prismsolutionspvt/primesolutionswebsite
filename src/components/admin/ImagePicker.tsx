"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { listMedia, uploadMedia, type MediaItem } from "@/admin/actions/media";
import type { MediaFolder } from "@/admin/fields";
import { useAdmin } from "./AdminProviders";

const FOLDERS: { id: MediaFolder | ""; label: string }[] = [
  { id: "", label: "All" },
  { id: "logos", label: "Logos" },
  { id: "team", label: "Team" },
  { id: "services", label: "Services" },
  { id: "industries", label: "Industries" },
  { id: "testimonials", label: "Testimonials" },
  { id: "announcements", label: "Announcements" },
  { id: "website", label: "Website" },
];

/**
 * Pick an image from the media library, or upload a new one into the right folder. Used by every image field,
 * so the same picture can be re-used across sections without uploading it again.
 */
export function ImagePicker({ open, onClose, onPick, folder }: { open: boolean; onClose: () => void; onPick: (path: string) => void; folder: MediaFolder }) {
  const { toast } = useAdmin();
  const [filter, setFilter] = useState<MediaFolder | "">(folder);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (p: number, f: MediaFolder | "", replace: boolean) => {
      setBusy(true);
      const r = await listMedia(p, f || undefined);
      setBusy(false);
      if (!r.ok) return toast("error", r.error);
      setTotal(r.total);
      setPage(p);
      setItems((cur) => (replace ? r.items : [...cur, ...r.items]));
    },
    [toast],
  );

  useEffect(() => {
    if (!open) return;
    setFilter(folder);
    load(0, folder, true);
  }, [open, folder, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast("error", "That image is larger than 5 MB.");
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", folder);
    const r = await uploadMedia(fd);
    setUploading(false);
    if (!r.ok) return toast("error", r.error);
    toast("ok", "Image uploaded.");
    onPick(r.item.path);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[150] grid place-items-center bg-[#040A1A]/70 p-3 backdrop-blur-sm sm:p-6" data-nested role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} role="dialog" aria-modal="true" data-nested aria-label="Choose an image" className="flex max-h-[90svh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-line bg-bg shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h3 className="font-display text-lg font-semibold">Choose an image</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full border border-line hover:bg-surface2">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-5">
          <div
            onDragOver={(e) => (e.preventDefault(), setDrag(true))}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => (e.preventDefault(), setDrag(false), upload(e.dataTransfer.files[0]))}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition ${drag ? "border-accent bg-accent/10" : "border-line bg-surface"}`}
          >
            {uploading ? <Loader2 className="h-7 w-7 animate-spin text-accent" aria-hidden /> : <UploadCloud className="h-7 w-7 text-accent" aria-hidden />}
            <p className="text-sm text-muted">{uploading ? "Uploading…" : "Drag an image here, or"}</p>
            <button type="button" disabled={uploading} onClick={() => input.current?.click()} className="btn btn-primary !min-h-[44px]">
              <ImagePlus className="h-[18px] w-[18px]" aria-hidden /> Upload a new image
            </button>
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/x-icon" className="sr-only" aria-label="Upload an image" onChange={(e) => (upload(e.target.files?.[0]), (e.target.value = ""))} />
            <p className="text-xs text-muted">JPG, PNG, WebP, AVIF, GIF or ICO · up to 5 MB · saved in “{folder}”</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Folders">
            {FOLDERS.map((f) => (
              <button key={f.label} type="button" role="tab" aria-selected={filter === f.id} onClick={() => (setFilter(f.id), load(0, f.id, true))} className={`min-h-[36px] rounded-full px-4 text-sm font-semibold transition ${filter === f.id ? "bg-accent text-[#0B1F4B]" : "border border-line text-muted hover:text-ink"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {items.length === 0 && !busy ? (
            <p className="mt-8 text-center text-sm text-muted">No images here yet. Upload one above.</p>
          ) : (
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => (onPick(m.path), onClose())} className="group block w-full overflow-hidden rounded-2xl border border-line bg-surface text-left transition hover:border-accent hover:shadow-lg">
                    <span className="block aspect-square overflow-hidden bg-[repeating-conic-gradient(rgb(var(--line))_0_25%,transparent_0_50%)] [background-size:16px_16px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt={m.alt || m.filename} loading="lazy" decoding="async" className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
                    </span>
                    <span className="block truncate px-3 py-2 text-xs text-muted">{m.filename}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {items.length < total && (
            <div className="mt-6 text-center">
              <button type="button" disabled={busy} onClick={() => load(page + 1, filter, false)} className="btn btn-ghost !min-h-[44px]">
                {busy ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
