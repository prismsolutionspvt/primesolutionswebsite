"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Trash2 } from "lucide-react";
import { addEnquiryNote, deleteEnquiry, deleteEnquiryNote, setEnquiryStatus } from "@/admin/actions/enquiries";
import { ENQUIRY_STATUSES, STATUS_LABEL } from "@/admin/constants";
import { useAdmin } from "./AdminProviders";

export function StatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const { toast } = useAdmin();
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">Status</span>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          const prev = value;
          setValue(next);
          start(async () => {
            const r = await setEnquiryStatus(id, next);
            if (!r.ok) {
              setValue(prev);
              return toast("error", r.error);
            }
            toast("ok", `Marked as ${STATUS_LABEL[next as keyof typeof STATUS_LABEL]}.`);
            router.refresh();
          });
        }}
        className="min-h-[48px] w-full rounded-xl border border-line bg-bg px-4 text-[0.95rem] outline-none focus:border-accent focus:shadow-[0_0_0_4px_rgb(var(--accent)/0.16)]"
      >
        {ENQUIRY_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function NoteForm({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useAdmin();
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        start(async () => {
          const r = await addEnquiryNote(id, text);
          if (!r.ok) return toast("error", r.error);
          setText("");
          toast("ok", "Note added.");
          router.refresh();
        });
      }}
    >
      <label htmlFor="note" className="mb-1.5 block text-sm font-semibold">
        Add an internal note
      </label>
      <textarea id="note" rows={3} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Only you can see this. For example: called back, sending a proposal on Friday." className="w-full resize-y rounded-xl border border-line bg-bg px-4 py-3 text-[0.95rem] outline-none focus:border-accent focus:shadow-[0_0_0_4px_rgb(var(--accent)/0.16)]" />
      <button type="submit" disabled={pending || !text.trim()} className="btn btn-primary mt-3 !min-h-[44px] disabled:opacity-50">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />} Save note
      </button>
    </form>
  );
}

export function DeleteNoteButton({ noteId, enquiryId }: { noteId: string; enquiryId: string }) {
  const router = useRouter();
  const { toast, confirm } = useAdmin();
  const [, start] = useTransition();
  return (
    <button
      type="button"
      aria-label="Delete note"
      onClick={async () => {
        if (!(await confirm({ title: "Delete this note?", body: "This cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
        start(async () => {
          const r = await deleteEnquiryNote(noteId, enquiryId);
          if (!r.ok) return toast("error", r.error);
          router.refresh();
        });
      }}
      className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-red-600"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function DeleteEnquiryButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const { toast, confirm } = useAdmin();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (!(await confirm({ title: "Delete this enquiry?", body: <>The enquiry from {name} and all of its notes will be permanently deleted. This cannot be undone.</>, confirmLabel: "Delete enquiry", danger: true }))) return;
        start(async () => {
          const r = await deleteEnquiry(id);
          if (!r.ok) return toast("error", r.error);
          toast("ok", "Enquiry deleted.");
          router.push("/admin/enquiries");
          router.refresh();
        });
      }}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-muted transition hover:border-red-500 hover:text-red-600"
    >
      <Trash2 className="h-4 w-4" aria-hidden /> Delete enquiry
    </button>
  );
}
