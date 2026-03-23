export default function AnalyticsLoading() {
  return (
    <div className="max-w-2xl">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-9 w-32 bg-[#e8e2dc] rounded-2xl animate-pulse" />
        <div className="h-4 w-56 bg-[#e8e2dc] rounded-xl animate-pulse mt-2" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e8e2dc] p-5">
            <div className="h-3 w-20 bg-[#e8e2dc] rounded-xl animate-pulse mb-2" />
            <div className="h-8 w-16 bg-[#e8e2dc] rounded-xl animate-pulse" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white rounded-2xl border border-[#e8e2dc] p-5">
        <div className="h-5 w-36 bg-[#e8e2dc] rounded-xl animate-pulse mb-4" />
        <div className="h-48 w-full bg-[#e8e2dc] rounded-xl animate-pulse" />
      </div>

      {/* Recent activity skeleton */}
      <div className="mt-6 bg-white rounded-2xl border border-[#e8e2dc] p-5">
        <div className="h-5 w-32 bg-[#e8e2dc] rounded-xl animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#e8e2dc] animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-[#e8e2dc] rounded-xl animate-pulse" />
                <div className="h-3 w-24 bg-[#e8e2dc] rounded-xl animate-pulse mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
