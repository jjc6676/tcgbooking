import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/book" className="font-semibold text-lg">
          TCG Booking
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/book" className="text-sm text-gray-600 hover:text-gray-900">
            Stylists
          </Link>
          <Link href="/appointments" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline">
            My Appointments
          </Link>
          {user ? (
            <SignOutButton />
          ) : (
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}
