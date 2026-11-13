type P = { className?: string };
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const InstagramIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
export const WhatsappIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.3 15l-.3-.18-3.1.82.83-3.03-.2-.32A8.1 8.1 0 0 1 12.04 3.8Zm-3.2 3.9c-.2 0-.5.07-.77.36-.26.3-1 .98-1 2.4 0 1.4 1.02 2.77 1.16 2.96.15.2 2 3.2 4.93 4.36 2.43.96 2.92.77 3.45.72.53-.05 1.7-.7 1.94-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.2-.55-.34-.3-.15-1.7-.84-1.97-.94-.26-.1-.45-.15-.64.15-.2.28-.74.93-.9 1.12-.17.2-.33.22-.62.07-.3-.14-1.2-.44-2.3-1.4-.85-.76-1.43-1.7-1.6-1.98-.16-.3-.02-.45.13-.6.13-.13.3-.34.44-.5.15-.17.2-.3.3-.48.1-.2.05-.37-.02-.52-.07-.15-.65-1.6-.9-2.18-.23-.56-.47-.48-.64-.49h-.55Z" />
  </svg>
);
