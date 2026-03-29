import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminContext } from "@/lib/supabase/admin-auth";
import { log } from "@/lib/logger";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.full_name !== undefined) updates.full_name = body.full_name?.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from("profiles")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    log.error("api/admin/clients/[id]/profile PATCH", { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
