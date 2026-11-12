"use client";
import { whatsappLink } from "@/lib/config";
import { WhatsappIcon } from "@/components/ui/SocialIcons";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Prism Solutions on WhatsApp"
      className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-14 items-center rounded-full bg-[#25D366] pl-[14px] pr-[14px] text-white shadow-[0_10px_30px_-8px_rgb(0,0,0,0.45)] transition-all duration-500 ease-out hover:pr-5 focus-visible:pr-5 sm:bottom-6 sm:right-6"
    >
      <WhatsappIcon className="h-7 w-7 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-500 ease-out group-hover:ml-2.5 group-hover:max-w-[10rem] group-hover:opacity-100 group-focus-visible:ml-2.5 group-focus-visible:max-w-[10rem] group-focus-visible:opacity-100">
        Chat on WhatsApp
      </span>
    </a>
  );
}
