export default function HoursLoading() {
  return (
    <div className="max-w-2xl">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-9 w-48 bg-[#e8e2dc] rounded-2xl animate-pulse" />
        <div className="h-4 w-64 bg-[#e8e2dc] rounded-xl animate-pulse mt-2" />
      </div>

      {/* Days list skeleton */}
      <div className="bg-white rounded-2xl border border-[#e8e2dc] divide-y divide-[#f5f0eb] overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="h-5 w-24 bg-[#e8e2dc] rounded-xl animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-28 bg-[#e8e2dc] rounded-xl animate-pulse" />
              <div className="w-4 h-4 bg-[#e8e2dc] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Overrides section skeleton */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-36 bg-[#e8e2dc] rounded-xl animate-pulse" />
          <div className="h-9 w-28 bg-[#e8e2dc] rounded-full animate-pulse" />
        </div>
        <div className="bg-white rounded-2xl border border-[#e8e2dc] p-5">
          <div className="h-4 w-48 bg-[#e8e2dc] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
