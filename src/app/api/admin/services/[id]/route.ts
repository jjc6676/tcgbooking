import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function getStylistId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("stylists")
    .select("id")
    .eq("user_id", userId)
    .single();
  return data?.id ?? null;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stylistId = await getStylistId(supabase, user.id);
  if (!stylistId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stylistId = await getStylistId(supabase, user.id);
  if (!stylistId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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
