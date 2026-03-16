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
    return NextResponse.json({ services: [] });
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("stylist_id", stylistId)
    .order("created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ services: data });
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
      { error: "Create your profile before adding services." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { name, duration_minutes, internal_price_cents } = body as {
    name: string;
    duration_minutes: number;
    internal_price_cents: number;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!duration_minutes || duration_minutes < 1) {
    return NextResponse.json({ error: "duration_minutes must be at least 1" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("services")
    .insert({
      stylist_id: stylistId,
      name: name.trim(),
      duration_minutes,
      internal_price_cents: internal_price_cents ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ service: data }, { status: 201 });
}
