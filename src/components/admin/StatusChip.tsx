import { STATUS_LABEL, STATUS_STYLE, type EnquiryStatus } from "@/admin/constants";

export function StatusChip({ status }: { status: string }) {
  const s = (status in STATUS_LABEL ? status : "new") as EnquiryStatus;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[s]}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[s]}
    </span>
  );
}
