export type UserRole = "client" | "stylist" | "admin";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stylist {
  id: string;
  user_id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  stylist_id: string;
  name: string;
  duration_minutes: number;
  internal_price_cents: number;
  is_active: boolean;
  created_at: string;
}

export interface OperationalHour {
  id: string;
  stylist_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  open_time: string; // HH:MM:SS
  close_time: string; // HH:MM:SS
}

export interface BlockedTime {
  id: string;
  stylist_id: string;
  start_at: string;
  end_at: string;
  reason: string | null;
}

export interface Appointment {
  id: string;
  client_id: string | null;
  stylist_id: string;
  service_id: string | null;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  created_at: string;
}

export interface AppointmentWithDetails extends Appointment {
  client?: Pick<Profile, "id" | "full_name"> | null;
  service?: Pick<Service, "id" | "name" | "duration_minutes"> | null;
}
