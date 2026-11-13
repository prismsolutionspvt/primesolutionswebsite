import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

/** Tells the public site whether to show the (otherwise hidden) Admin Panel link. Returns a bare boolean, nothing else. */
export async function GET() {
  const admin = await getAdmin();
  return NextResponse.json({ admin: Boolean(admin) }, { headers: { "Cache-Control": "no-store" } });
}
