import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import MobileNav from "@/components/MobileNav";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profile", label: "My Profile" },
  { href: "/admin/hours", label: "Hours" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/blocked-times", label: "Blocked Times" },
  { href: "/admin/appointments", label: "Appointments" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="sm:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
        <span className="font-semibold text-base">TCG Booking</span>
        <MobileNav items={navItems} />
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden sm:flex w-56 bg-white border-r flex-col min-h-screen">
          <div className="px-6 py-4 border-b">
            <span className="font-semibold text-base">TCG Booking</span>
            <p className="text-xs text-gray-400 mt-0.5">Admin</p>
          </div>
          <nav className="flex-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 py-4 border-t">
            <SignOutButton variant="link" />
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
