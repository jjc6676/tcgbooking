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

export async function GET() {
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
    return NextResponse.json({ blocked_times: [] });
  }

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
    return NextResponse.json(
      { error: "Create your profile before blocking time." },
      { status: 400 }
    );
  }

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
