import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/supabase/admin-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const supabase = await createClient();

  const body = await request.json();
  const { name, duration_minutes, internal_price_cents, is_active } = body as {
    name?: string;
    duration_minutes?: number;
    internal_price_cents?: number;
    is_active?: boolean;
  };

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (duration_minutes !== undefined) updates.duration_minutes = duration_minutes;
  if (internal_price_cents !== undefined) updates.internal_price_cents = internal_price_cents;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", params.id)
    .eq("stylist_id", stylistId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ service: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const supabase = await createClient();

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", params.id)
    .eq("stylist_id", stylistId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
