import Link from "next/link";

const sections = [
  {
    href: "/admin/profile",
    title: "My Profile",
    description: "Set your name, bio, and avatar shown to clients.",
  },
  {
    href: "/admin/hours",
    title: "Operational Hours",
    description: "Configure which days and times you accept bookings.",
  },
  {
    href: "/admin/services",
    title: "Services",
    description: "Manage the services you offer, duration, and pricing.",
  },
  {
    href: "/admin/blocked-times",
    title: "Blocked Times",
    description: "Block off vacation days or unavailable windows.",
  },
  {
    href: "/admin/appointments",
    title: "Appointments",
    description: "View upcoming bookings and update their status.",
  },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Manage your schedule, services, and client appointments.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block bg-white border rounded-lg p-5 hover:shadow-sm hover:border-gray-300 transition-all"
          >
            <h2 className="font-semibold text-gray-900 mb-1">{s.title}</h2>
            <p className="text-sm text-gray-500">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
