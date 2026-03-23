export default function ProfileLoading() {
  return (
    <div className="max-w-2xl">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-9 w-32 bg-[#e8e2dc] rounded-2xl animate-pulse" />
        <div className="h-4 w-48 bg-[#e8e2dc] rounded-xl animate-pulse mt-2" />
      </div>

      {/* Profile form skeleton */}
      <div className="bg-white rounded-2xl border border-[#e8e2dc] p-5 space-y-5">
        {/* Avatar section */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[#e8e2dc] animate-pulse" />
          <div className="h-9 w-28 bg-[#e8e2dc] rounded-full animate-pulse" />
        </div>

        {/* Name field */}
        <div>
          <div className="h-3 w-16 bg-[#e8e2dc] rounded-xl animate-pulse mb-2" />
          <div className="h-11 w-full bg-[#e8e2dc] rounded-xl animate-pulse" />
        </div>

        {/* Bio field */}
        <div>
          <div className="h-3 w-12 bg-[#e8e2dc] rounded-xl animate-pulse mb-2" />
          <div className="h-24 w-full bg-[#e8e2dc] rounded-xl animate-pulse" />
        </div>

        {/* Cancellation policy field */}
        <div>
          <div className="h-3 w-36 bg-[#e8e2dc] rounded-xl animate-pulse mb-2" />
          <div className="h-20 w-full bg-[#e8e2dc] rounded-xl animate-pulse" />
        </div>

        {/* Submit button */}
        <div className="h-11 w-32 bg-[#e8e2dc] rounded-full animate-pulse" />
      </div>
    </div>
  );
}
