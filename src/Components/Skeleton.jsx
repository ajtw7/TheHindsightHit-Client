const Skeleton = ({ className = '' }) => (
  <div className={`bg-slate-700/50 rounded-xl animate-pulse ${className}`} />
);

export function ProfileSkeleton() {
  return (
    <div className="bg-slate-900 min-h-screen px-4 py-6 w-full max-w-5xl mx-auto">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-6 w-32 mb-3" />
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
        {Array.from({ length: 11 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}

export function TransfersSkeleton() {
  return (
    <div className="bg-slate-900 min-h-screen px-4 py-6 w-full max-w-4xl mx-auto">
      <Skeleton className="h-8 w-36 mb-2" />
      <Skeleton className="h-4 w-72 mb-5" />
      <Skeleton className="h-12 w-full mb-5" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mb-3">
          <Skeleton className="h-48 w-full" />
        </div>
      ))}
    </div>
  );
}

export function GWHistorySkeleton() {
  return (
    <div className="bg-slate-900 min-h-screen px-4 py-6 w-full max-w-5xl mx-auto">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-12 w-full mb-5" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {Array.from({ length: 11 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}

export function FixturesSkeleton() {
  return (
    <div className="bg-slate-900 min-h-screen px-4 py-6 w-full max-w-4xl mx-auto">
      <Skeleton className="h-8 w-36 mb-4" />
      <Skeleton className="h-12 w-full mb-5" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="mb-3">
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
