import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import RequestsPageClient from "./RequestsPageClient";

function normalizeFirst<T>(val: T | T[] | null | undefined): T | null {
  if (Array.isArray(val)) return val[0] ?? null;
  return val ?? null;
}

export default async function RequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: stylist } = await supabase
    .from("stylists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!stylist) {
    return <RequestsPageClient initialRequests={[]} />;
  }

  const serviceClient = createServiceClient();

  const { data: rawRequests } = await serviceClient
    .from("appointments")
    .select(`
      id, start_at, end_at, status, created_at, client_notes,
      reschedule_preferred_time, reschedule_note,
      service:services!service_id(id, name, duration_minutes, internal_price_cents),
      client:profiles!client_id(id, full_name),
      appointment_services(service_id, service:services(id, name, duration_minutes, internal_price_cents))
    `)
    .eq("stylist_id", stylist.id)
    .in("status", ["pending", "reschedule_requested"])
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true });

  interface ServiceInfo {
    id: string;
    name: string;
    duration_minutes: number;
    internal_price_cents?: number;
  }

  const requests = (rawRequests ?? []).map((appt) => ({
    ...appt,
    service: normalizeFirst(appt.service) as ServiceInfo | null,
    client: normalizeFirst(appt.client) as { id: string; full_name: string | null } | null,
    appointment_services: (appt.appointment_services ?? []).map((as: { service_id: string; service: unknown }) => ({
      service_id: as.service_id,
      service: normalizeFirst(as.service) as ServiceInfo | null,
    })),
  }));

  return <RequestsPageClient initialRequests={requests} />;
}
