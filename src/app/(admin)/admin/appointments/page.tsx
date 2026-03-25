import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import AppointmentsPageClient from "./AppointmentsPageClient";

// Normalize Supabase join results (arrays to single objects)
function normalizeFirst<T>(val: T | T[] | null | undefined): T | null {
  if (Array.isArray(val)) return val[0] ?? null;
  return val ?? null;
}

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: stylist } = await supabase
    .from("stylists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!stylist) {
    return <AppointmentsPageClient initialAppointments={[]} />;
  }

  const serviceClient = createServiceClient();
  const now = new Date().toISOString();

  // Fetch upcoming appointments (not cancelled, starting from now)
  const { data: rawAppointments } = await serviceClient
    .from("appointments")
    .select(`
      id,
      start_at,
      end_at,
      status,
      created_at,
      client_notes,
      reschedule_preferred_time,
      reschedule_note,
      service:services!service_id(id, name, duration_minutes, internal_price_cents),
      client:profiles!client_id(id, full_name),
      walk_in:walk_in_clients!walk_in_client_id(id, full_name),
      appointment_services(service_id, service:services(id, name, duration_minutes, internal_price_cents))
    `)
    .eq("stylist_id", stylist.id)
    .neq("status", "cancelled")
    .gte("start_at", now)
    .order("start_at", { ascending: true })
    .limit(50);

  interface ServiceInfo {
    id: string;
    name: string;
    duration_minutes: number;
    internal_price_cents?: number;
  }

  // Normalize joins that may come back as arrays
  const appointments = (rawAppointments ?? []).map((appt) => ({
    ...appt,
    service: normalizeFirst(appt.service) as ServiceInfo | null,
    client: normalizeFirst(appt.client) as { id: string; full_name: string | null } | null,
    walk_in: normalizeFirst(appt.walk_in) as { id: string; full_name: string | null } | null,
    appointment_services: (appt.appointment_services ?? []).map((as: { service_id: string; service: unknown }) => ({
      service_id: as.service_id,
      service: normalizeFirst(as.service) as ServiceInfo | null,
    })),
  }));

  return <AppointmentsPageClient initialAppointments={appointments} />;
}
