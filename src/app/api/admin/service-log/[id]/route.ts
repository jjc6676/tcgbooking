import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminContext } from "@/lib/supabase/admin-auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const body = await request.json();
  const updateFields: Record<string, unknown> = {};

  if (body.service_name !== undefined) updateFields.service_name = body.service_name.trim();
  if (body.price_cents !== undefined) updateFields.price_cents = body.price_cents;
  if (body.visit_date !== undefined) updateFields.visit_date = body.visit_date;
  if (body.notes !== undefined) updateFields.notes = body.notes?.trim() || null;
  if (body.service_id !== undefined) updateFields.service_id = body.service_id || null;

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from("client_service_log")
    .update(updateFields)
    .eq("id", params.id)
    .eq("stylist_id", stylistId)
    .select()
    .single();

  if (error) {
    console.error("[api/admin/service-log/[id] PATCH]", { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entry: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = getAdminContext(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { stylistId } = ctx;

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("client_service_log")
    .delete()
    .eq("id", params.id)
    .eq("stylist_id", stylistId);

  if (error) {
    console.error("[api/admin/service-log/[id] DELETE]", { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
