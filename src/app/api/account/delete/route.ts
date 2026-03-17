import { createServerClient } from "@supabase/ssr";
import { createClient as createAnonClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // 1. Verify the requesting user is authenticated
  const anonSupabase = await createAnonClient();
  const { data: { user }, error: authError } = await anonSupabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Create admin client with service role key
  const cookieStore = await cookies();
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* ignore */ }
        },
      },
    }
  );

  // 3. Cancel all future pending/confirmed appointments for this client
  const now = new Date().toISOString();
  await adminSupabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("client_id", user.id)
    .in("status", ["pending", "confirmed"])
    .gte("start_at", now);

  // 4. Delete profile row (appointments have client_id FK — set null or cascade)
  await adminSupabase
    .from("profiles")
    .delete()
    .eq("id", user.id);

  // 5. Sign out and delete the auth user
  await anonSupabase.auth.signOut();
  const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error("Failed to delete auth user:", deleteError);
    // Non-fatal — profile is already gone, auth user cleanup can be done manually
  }

  return NextResponse.json({ success: true });
}
