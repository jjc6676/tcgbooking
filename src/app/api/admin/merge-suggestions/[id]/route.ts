import { createServiceClient } from "@/lib/supabase/service";
import { getAdminContext } from "@/lib/supabase/admin-auth";
import { NextResponse } from "next/server";
import { log } from "@/lib/logger";

// GET /api/admin/merge-suggestions/[id] — preview what will transfer
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const { id } = await params;
  const serviceClient = createServiceClient();

  // Fetch the pending merge to get walk_in_client_id and auth_client_id
  const { data: merge, error: mergeError } = await serviceClient
    .from("pending_merges")
    .select("id, auth_client_id, walk_in_client_id")
    .eq("id", id)
    .eq("stylist_id", stylistId)
    .single();

  if (mergeError || !merge) {
    return NextResponse.json({ error: "Merge suggestion not found" }, { status: 404 });
  }

  const walkInId = merge.walk_in_client_id as string;
  const authId = merge.auth_client_id as string;

  // Count what will transfer in parallel
  const [apptResult, logResult, waitlistResult, walkInResult, authResult] = await Promise.all([
    serviceClient
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("walk_in_client_id", walkInId),
    serviceClient
      .from("client_service_log")
      .select("id", { count: "exact", head: true })
      .eq("walk_in_client_id", walkInId),
    serviceClient
      .from("waitlist_entries")
      .select("id", { count: "exact", head: true })
      .eq("walk_in_client_id", walkInId),
    serviceClient
      .from("walk_in_clients")
      .select("id, full_name, phone, email, notes")
      .eq("id", walkInId)
      .single(),
    serviceClient
      .from("profiles")
      .select("id, full_name, phone")
      .eq("id", authId)
      .single(),
  ]);

  return NextResponse.json({
    preview: {
      appointmentCount: apptResult.count ?? 0,
      serviceLogCount: logResult.count ?? 0,
      waitlistCount: waitlistResult.count ?? 0,
      willTransferPhone: !!(
        walkInResult.data?.phone &&
        (!authResult.data?.phone || authResult.data.phone === "")
      ),
      willTransferNotes: !!(walkInResult.data?.notes),
      walkIn: walkInResult.data,
      authClient: authResult.data,
    },
  });
}

// POST /api/admin/merge-suggestions/[id] — merge or dismiss
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = (body as { action?: string }).action;
  if (action !== "merge" && action !== "dismiss") {
    return NextResponse.json({ error: "action must be 'merge' or 'dismiss'" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Verify this merge belongs to this stylist
  const { data: merge, error: mergeError } = await serviceClient
    .from("pending_merges")
    .select("id, auth_client_id, walk_in_client_id, status")
    .eq("id", id)
    .eq("stylist_id", stylistId)
    .single();

  if (mergeError || !merge) {
    return NextResponse.json({ error: "Merge suggestion not found" }, { status: 404 });
  }

  if (merge.status !== "pending") {
    return NextResponse.json({ error: "Merge suggestion is no longer pending" }, { status: 409 });
  }

  if (action === "dismiss") {
    const { error } = await serviceClient
      .from("pending_merges")
      .update({ status: "dismissed", resolved_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      log.error("api/admin/merge-suggestions dismiss", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  // action === "merge" — call the atomic RPC
  const { error: rpcError } = await serviceClient.rpc("merge_walk_in_into_auth_client", {
    p_walk_in_client_id: merge.walk_in_client_id,
    p_auth_client_id: merge.auth_client_id,
    p_stylist_id: stylistId,
  });

  if (rpcError) {
    log.error("api/admin/merge-suggestions merge", { error: rpcError.message });
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
