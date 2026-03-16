import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex flex-col">
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
          <Link
            href="/login"
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
