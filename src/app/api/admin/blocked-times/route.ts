import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/supabase/admin-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blocked_times")
    .select("*")
    .eq("stylist_id", stylistId)
    .gte("end_at", new Date().toISOString())
    .order("start_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ blocked_times: data });
}

export async function POST(request: Request) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const supabase = await createClient();

  const body = await request.json();
  const { start_at, end_at, reason } = body as {
    start_at: string;
    end_at: string;
    reason?: string;
  };

  if (!start_at || !end_at) {
    return NextResponse.json({ error: "start_at and end_at are required" }, { status: 400 });
  }

  if (new Date(end_at) <= new Date(start_at)) {
    return NextResponse.json({ error: "end_at must be after start_at" }, { status: 400 });
  }

  // Check for conflicting appointments
  const { data: conflicts } = await supabase
    .from("appointments")
    .select("id, start_at, end_at, status, client:profiles!client_id(full_name), service:services!service_id(name)")
    .eq("stylist_id", stylistId)
    .in("status", ["pending", "confirmed"])
    .lt("start_at", end_at)
    .gt("end_at", start_at);

  const force = body.force === true;
  const cancelConflicts = body.cancel_conflicts === true;

  if (conflicts && conflicts.length > 0 && !force && !cancelConflicts) {
    return NextResponse.json({
      needs_confirmation: true,
      conflicts: conflicts.map((c) => {
        const client = c.client as unknown as { full_name: string | null } | null;
        const service = c.service as unknown as { name: string } | null;
        return {
          id: c.id,
          start_at: c.start_at,
          end_at: c.end_at,
          status: c.status,
          client_name: client?.full_name ?? "Guest",
          service_name: service?.name ?? "Service",
        };
      }),
      message: `This time overlaps with ${conflicts.length} existing appointment(s).`,
    }, { status: 200 });
  }

  // Cancel conflicts if requested
  if (cancelConflicts && conflicts && conflicts.length > 0) {
    const conflictIds = conflicts.map((c) => c.id);
    await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .in("id", conflictIds)
      .eq("stylist_id", stylistId);
  }

  const { data, error } = await supabase
    .from("blocked_times")
    .insert({ stylist_id: stylistId, start_at, end_at, reason: reason ?? null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ blocked_time: data }, { status: 201 });
}
