import { createServiceClient } from "@/lib/supabase/service";
import { getAdminContext } from "@/lib/supabase/admin-auth";
import { NextResponse } from "next/server";
import { log } from "@/lib/logger";

export async function GET(request: Request) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from("pending_merges")
    .select(`
      id,
      match_reason,
      status,
      created_at,
      auth_client:profiles!auth_client_id(id, full_name),
      walk_in:walk_in_clients!walk_in_client_id(id, full_name, phone, email, notes)
    `)
    .eq("stylist_id", stylistId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    log.error("api/admin/merge-suggestions GET", { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suggestions: data ?? [] });
}

// POST /api/admin/merge-suggestions — admin manually initiates a merge suggestion
export async function POST(request: Request) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { auth_client_id, walk_in_client_id } = body as {
    auth_client_id?: string;
    walk_in_client_id?: string;
  };

  if (!auth_client_id || !walk_in_client_id) {
    return NextResponse.json({ error: "auth_client_id and walk_in_client_id are required" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Verify the walk-in belongs to this stylist and isn't already merged
  const { data: walkIn, error: walkInError } = await serviceClient
    .from("walk_in_clients")
    .select("id")
    .eq("id", walk_in_client_id)
    .eq("stylist_id", stylistId)
    .is("merged_into_profile_id", null)
    .single();

  if (walkInError || !walkIn) {
    return NextResponse.json({ error: "Walk-in client not found or already merged" }, { status: 404 });
  }

  const { data, error } = await serviceClient
    .from("pending_merges")
    .upsert(
      {
        stylist_id: stylistId,
        auth_client_id,
        walk_in_client_id,
        match_reason: "admin_manual",
        status: "pending",
      },
      { onConflict: "auth_client_id,walk_in_client_id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    log.error("api/admin/merge-suggestions POST", { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suggestion: data }, { status: 201 });
}
