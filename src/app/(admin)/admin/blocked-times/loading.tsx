export default function BlockedTimesLoading() {
  return (
    <div className="max-w-2xl">
      {/* Header skeleton */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="h-9 w-36 bg-[#e8e2dc] rounded-2xl animate-pulse" />
          <div className="h-4 w-60 bg-[#e8e2dc] rounded-xl animate-pulse mt-2" />
        </div>
        <div className="h-11 w-24 bg-[#e8e2dc] rounded-full animate-pulse" />
      </div>

      {/* Blocked times list skeleton */}
      <div className="bg-white rounded-2xl border border-[#e8e2dc] divide-y divide-[#f5f0eb] overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="h-4 w-40 bg-[#e8e2dc] rounded-xl animate-pulse" />
              <div className="h-3 w-28 bg-[#e8e2dc] rounded-xl animate-pulse mt-2" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-[#e8e2dc] rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
