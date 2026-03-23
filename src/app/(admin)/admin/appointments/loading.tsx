export default function AppointmentsLoading() {
  return (
    <div className="max-w-2xl">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-9 w-40 bg-[#e8e2dc] rounded-2xl animate-pulse" />
        <div className="h-4 w-56 bg-[#e8e2dc] rounded-xl animate-pulse mt-2" />
      </div>

      {/* Date picker skeleton */}
      <div className="h-11 w-full bg-[#e8e2dc] rounded-xl animate-pulse mb-5" />

      {/* Appointments list skeleton */}
      <div className="bg-white rounded-2xl border border-[#e8e2dc] divide-y divide-[#f5f0eb] overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e8e2dc] animate-pulse" />
                <div>
                  <div className="h-4 w-28 bg-[#e8e2dc] rounded-xl animate-pulse" />
                  <div className="h-3 w-20 bg-[#e8e2dc] rounded-xl animate-pulse mt-1" />
                </div>
              </div>
              <div className="h-6 w-20 bg-[#e8e2dc] rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-[#e8e2dc] rounded-xl animate-pulse" />
              <div className="h-4 w-32 bg-[#e8e2dc] rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
