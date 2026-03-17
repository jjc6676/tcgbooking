import ClientNav from "@/components/ClientNav";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <ClientNav />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#e8e2dc] bg-white mt-16">
        <div className="max-w-2xl mx-auto px-6 py-8 text-center space-y-3">
          <p className="font-display text-[#1a1714] text-lg">Keri Choplin</p>
          <p className="text-sm text-[#8a7e78]">Tue – Sat &nbsp;·&nbsp; Lafayette, Louisiana</p>
          <div className="flex items-center justify-center gap-4 text-xs text-[#8a7e78]">
            <a href="mailto:kerichoplin@gmail.com" className="hover:text-[#9b6f6f] transition-colors">
              kerichoplin@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
