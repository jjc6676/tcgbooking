export default function ClientDetailLoading() {
  return (
    <div className="max-w-2xl">
      {/* Back link skeleton */}
      <div className="h-4 w-20 bg-[#e8e2dc] rounded-xl animate-pulse mb-6" />

      {/* Client header skeleton */}
      <div className="bg-white rounded-2xl border border-[#e8e2dc] p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#e8e2dc] animate-pulse" />
          <div className="flex-1">
            <div className="h-6 w-40 bg-[#e8e2dc] rounded-xl animate-pulse" />
            <div className="h-4 w-48 bg-[#e8e2dc] rounded-xl animate-pulse mt-2" />
            <div className="h-3 w-32 bg-[#e8e2dc] rounded-xl animate-pulse mt-2" />
          </div>
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e8e2dc] p-4 text-center">
            <div className="h-6 w-10 bg-[#e8e2dc] rounded-xl animate-pulse mx-auto" />
            <div className="h-3 w-16 bg-[#e8e2dc] rounded-xl animate-pulse mx-auto mt-2" />
          </div>
        ))}
      </div>

      {/* Notes section skeleton */}
      <div className="bg-white rounded-2xl border border-[#e8e2dc] p-5 mb-6">
        <div className="h-5 w-24 bg-[#e8e2dc] rounded-xl animate-pulse mb-3" />
        <div className="h-20 w-full bg-[#e8e2dc] rounded-xl animate-pulse" />
      </div>

      {/* Service history skeleton */}
      <div className="bg-white rounded-2xl border border-[#e8e2dc] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f5f0eb]">
          <div className="h-5 w-32 bg-[#e8e2dc] rounded-xl animate-pulse" />
        </div>
        <div className="divide-y divide-[#f5f0eb]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-28 bg-[#e8e2dc] rounded-xl animate-pulse" />
                  <div className="h-3 w-20 bg-[#e8e2dc] rounded-xl animate-pulse mt-1" />
                </div>
                <div className="h-4 w-16 bg-[#e8e2dc] rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
