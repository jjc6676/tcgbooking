import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/supabase/admin-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { log } from "@/lib/logger";

// ─── Zod validation ──────────────────────────────────────────────────────────

const PostServiceSchema = z.object({
  name: z.string().min(1, "name is required").max(100, "name max 100 characters"),
  duration_minutes: z.number().int().min(1, "duration_minutes min 1").max(480, "duration_minutes max 480"),
  internal_price_cents: z.number().int().min(0, "internal_price_cents min 0").max(999999, "internal_price_cents max 999999").optional().default(0),
});

export async function GET(request: Request) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("stylist_id", stylistId)
    .order("created_at");

  if (error) {
    log.error("api/admin/services GET", { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ services: data });
}

export async function POST(request: Request) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const supabase = await createClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PostServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", details: parsed.error.issues.map((e) => ({ path: e.path.join("."), message: e.message })) },
      { status: 400 }
    );
  }

  const { name, duration_minutes, internal_price_cents } = parsed.data;

  const { data, error } = await supabase
    .from("services")
    .insert({
      stylist_id: stylistId,
      name: name.trim(),
      duration_minutes,
      internal_price_cents,
    })
    .select()
    .single();

  if (error) {
    log.error("api/admin/services POST", { error: error.message, name });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ service: data }, { status: 201 });
}
