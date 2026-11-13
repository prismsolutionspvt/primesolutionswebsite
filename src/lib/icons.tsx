import { Briefcase, Building2, CalendarCheck, Globe, Headset, Laptop, Mail, Megaphone, Phone, Search, Shield, Star, Target, Users, Wrench, LineChart, type LucideIcon } from "lucide-react";

/** Icon keys the owner can pick for a service that has no built-in illustration (Admin → Services → Icon). */
export const ICON_MAP: Record<string, LucideIcon> = {
  headset: Headset,
  phone: Phone,
  calendar: CalendarCheck,
  megaphone: Megaphone,
  search: Search,
  target: Target,
  users: Users,
  globe: Globe,
  briefcase: Briefcase,
  chart: LineChart,
  mail: Mail,
  shield: Shield,
  star: Star,
  wrench: Wrench,
  building: Building2,
  laptop: Laptop,
};
