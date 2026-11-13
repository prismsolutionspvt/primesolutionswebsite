"use client";
import { createContext, useContext } from "react";
import type { SiteContent } from "@/lib/content/types";

const Ctx = createContext<SiteContent | null>(null);

/** Hands the (server-fetched, cached) site content to client components once, instead of every component fetching. */
export function ContentProvider({ value, children }: { value: SiteContent; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContent(): SiteContent {
  const v = useContext(Ctx);
  if (!v) throw new Error("useContent must be used inside <ContentProvider>");
  return v;
}
