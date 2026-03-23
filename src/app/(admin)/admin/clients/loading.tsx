export default function ClientsLoading() {
  return (
    <div className="max-w-2xl">
      {/* Header skeleton */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="h-9 w-32 bg-[#e8e2dc] rounded-2xl animate-pulse" />
          <div className="h-4 w-48 bg-[#e8e2dc] rounded-xl animate-pulse mt-2" />
        </div>
        <div className="h-11 w-28 bg-[#e8e2dc] rounded-full animate-pulse" />
      </div>

      {/* Search skeleton */}
      <div className="h-11 w-full bg-[#e8e2dc] rounded-xl animate-pulse mb-5" />

      {/* Client list skeleton */}
      <div className="bg-white rounded-2xl border border-[#e8e2dc] divide-y divide-[#f5f0eb] overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            {/* Avatar skeleton */}
            <div className="w-10 h-10 rounded-full bg-[#e8e2dc] animate-pulse flex-shrink-0" />

            {/* Info skeleton */}
            <div className="flex-1 min-w-0">
              <div className="h-4 w-32 bg-[#e8e2dc] rounded-xl animate-pulse" />
              <div className="h-3 w-40 bg-[#e8e2dc] rounded-xl animate-pulse mt-2" />
            </div>

            {/* Stats skeleton */}
            <div className="text-right flex-shrink-0">
              <div className="h-4 w-6 bg-[#e8e2dc] rounded-xl animate-pulse ml-auto" />
              <div className="h-3 w-10 bg-[#e8e2dc] rounded-xl animate-pulse mt-1 ml-auto" />
            </div>

            {/* Last date skeleton (hidden on mobile) */}
            <div className="text-right flex-shrink-0 hidden sm:block">
              <div className="h-3 w-14 bg-[#e8e2dc] rounded-xl animate-pulse ml-auto" />
              <div className="h-3 w-16 bg-[#e8e2dc] rounded-xl animate-pulse mt-1 ml-auto" />
            </div>

            {/* Chevron */}
            <div className="w-4 h-4 bg-[#e8e2dc] rounded animate-pulse flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
