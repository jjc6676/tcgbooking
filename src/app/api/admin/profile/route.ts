import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: stylist, error } = await supabase
    .from("stylists")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stylist: stylist ?? null });
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

  const body = await request.json();
  const { name, bio, avatar_url, cancellation_policy } = body as {
    name: string;
    bio?: string;
    avatar_url?: string;
    cancellation_policy?: string | null;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("stylists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let result;
  if (existing) {
    result = await supabase
      .from("stylists")
      .update({ name: name.trim(), bio: bio ?? null, avatar_url: avatar_url ?? null, cancellation_policy: cancellation_policy ?? null })
      .eq("user_id", user.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from("stylists")
      .insert({ user_id: user.id, name: name.trim(), bio: bio ?? null, avatar_url: avatar_url ?? null, cancellation_policy: cancellation_policy ?? null })
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ stylist: result.data });
}
