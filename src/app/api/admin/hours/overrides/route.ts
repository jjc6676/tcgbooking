import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/supabase/admin-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("operational_hours_overrides")
    .select("*")
    .eq("stylist_id", stylistId)
    .order("effective_from");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ overrides: data });
}

export async function POST(request: Request) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const supabase = await createClient();

  const body = await request.json() as {
    label?: string;
    effective_from: string;
    effective_until: string;
    day_of_week?: number | null;
    open_time?: string | null;
    close_time?: string | null;
    is_closed?: boolean;
    note?: string | null;
    force?: boolean;
  };

  const { label, effective_from, effective_until, day_of_week, open_time, close_time, is_closed } = body;

  if (!effective_from || !effective_until) {
    return NextResponse.json({ error: "effective_from and effective_until are required" }, { status: 400 });
  }

  if (new Date(effective_from) > new Date(effective_until)) {
    return NextResponse.json({ error: "effective_from must be before effective_until" }, { status: 400 });
  }

  const closed = is_closed ?? false;

  if (!closed && (!open_time || !close_time)) {
    return NextResponse.json({ error: "open_time and close_time are required unless is_closed is true" }, { status: 400 });
  }

  // Check for conflicting appointments in the affected date range
  if (closed || open_time || close_time) {
    const rangeStart = `${effective_from}T00:00:00`;
    const rangeEnd = `${effective_until}T23:59:59`;

    const { data: affectedAppts } = await supabase
      .from("appointments")
      .select("id, start_at, end_at, status, client:profiles!client_id(full_name), service:services!service_id(name)")
      .eq("stylist_id", stylistId)
      .in("status", ["pending", "confirmed"])
      .gte("start_at", rangeStart)
      .lte("start_at", rangeEnd);

    if (affectedAppts && affectedAppts.length > 0 && !body.force) {
      return NextResponse.json({
        needs_confirmation: true,
        affected_appointments: affectedAppts.map((a) => {
          const client = a.client as unknown as { full_name: string | null } | null;
          const service = a.service as unknown as { name: string } | null;
          return {
            id: a.id,
            start_at: a.start_at,
            client_name: client?.full_name ?? "Guest",
            service_name: service?.name ?? "Service",
          };
        }),
        message: `${affectedAppts.length} appointment(s) fall within this date range.`,
      }, { status: 200 });
    }
  }

  // For single-day overrides (from=until, day_of_week=null), upsert to prevent duplicates
  const isSingleDay = effective_from === effective_until && (day_of_week === null || day_of_week === undefined);

  let data, error;

  if (isSingleDay) {
    // Delete any existing override for this exact single day, then insert fresh
    await supabase
      .from("operational_hours_overrides")
      .delete()
      .eq("stylist_id", stylistId)
      .eq("effective_from", effective_from)
      .eq("effective_until", effective_until)
      .is("day_of_week", null);

    ({ data, error } = await supabase
      .from("operational_hours_overrides")
      .insert({
        stylist_id: stylistId,
        label: label ?? null,
        effective_from,
        effective_until,
        day_of_week: null,
        open_time: closed ? null : (open_time ?? null),
        close_time: closed ? null : (close_time ?? null),
        is_closed: closed,
        ...(body.note !== undefined ? { note: body.note ?? null } : {}),
      })
      .select()
      .single());
  } else {
    ({ data, error } = await supabase
      .from("operational_hours_overrides")
      .insert({
        stylist_id: stylistId,
        label: label ?? null,
        effective_from,
        effective_until,
        day_of_week: day_of_week ?? null,
        open_time: closed ? null : (open_time ?? null),
        close_time: closed ? null : (close_time ?? null),
        is_closed: closed,
        ...(body.note !== undefined ? { note: body.note ?? null } : {}),
      })
      .select()
      .single());
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ override: data }, { status: 201 });
}
