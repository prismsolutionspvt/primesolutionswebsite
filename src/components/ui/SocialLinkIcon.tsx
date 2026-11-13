import { Globe } from "lucide-react";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/SocialIcons";

/** Icon for an owner-managed social link. Known platforms get their mark; anything else gets a neutral globe. */
export function SocialLinkIcon({ platform, className = "h-5 w-5" }: { platform: string; className?: string }) {
  const p = platform.toLowerCase();
  if (p.includes("instagram")) return <InstagramIcon className={className} />;
  if (p.includes("whatsapp")) return <WhatsappIcon className={className} />;
  return <Globe className={className} aria-hidden />;
}
