import ClientNav from "@/components/ClientNav";
import ClientAuthGuard from "@/components/ClientAuthGuard";
import ErrorBoundary from "@/components/ErrorBoundary";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f0f0]">
      <ClientAuthGuard />
      <ClientNav />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#d4c8c8] bg-white mt-16">
        <div className="max-w-2xl mx-auto px-6 py-8 text-center space-y-3">
          <p className="font-display text-[#28231c] text-lg">Keri Choplin</p>
          <p className="text-sm text-[#655356]">Tue – Fri &nbsp;·&nbsp; Lafayette, Louisiana</p>
          <div className="flex items-center justify-center gap-4 text-xs text-[#655356]">
            <a href="mailto:kerichoplin@gmail.com" className="hover:text-[#513b3c] transition-colors">
              kerichoplin@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
