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

  // When deactivating, check for future pending appointments using this service
  if (is_active === false && !body.force) {
    const { data: affected } = await supabase
      .from("appointments")
      .select("id, start_at, client:profiles!client_id(full_name)")
      .eq("stylist_id", stylistId)
      .eq("service_id", params.id)
      .in("status", ["pending", "confirmed"])
      .gte("start_at", new Date().toISOString());

    if (affected && affected.length > 0) {
      return NextResponse.json({
        needs_confirmation: true,
        affected_count: affected.length,
        affected_appointments: affected.map((a) => {
          const client = a.client as unknown as { full_name: string | null } | null;
          return {
            id: a.id,
            start_at: a.start_at,
            client_name: client?.full_name ?? "Guest",
          };
        }),
        message: `${affected.length} upcoming appointment(s) use this service.`,
      });
    }
  }

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

  // Check for future appointments using this service
  const { searchParams } = new URL(request.url);
  if (!searchParams.get("force")) {
    const { data: futureAppts } = await supabase
      .from("appointments")
      .select("id")
      .eq("stylist_id", stylistId)
      .eq("service_id", params.id)
      .in("status", ["pending", "confirmed"])
      .gte("start_at", new Date().toISOString());

    if (futureAppts && futureAppts.length > 0) {
      return NextResponse.json({
        needs_confirmation: true,
        affected_count: futureAppts.length,
        message: `${futureAppts.length} upcoming appointment(s) use this service. They will lose their service reference.`,
      });
    }
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
