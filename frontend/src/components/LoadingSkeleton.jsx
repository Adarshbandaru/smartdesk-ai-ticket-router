const LoadingSkeleton = ({ rows = 5, type = 'table' }) => {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 space-y-3">
            <div className="shimmer h-4 w-24 rounded-lg" />
            <div className="shimmer h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="shimmer h-5 w-40 rounded-lg" />
        <div className="shimmer h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="shimmer h-5 w-48 rounded-lg" />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="shimmer h-4 w-12 rounded-lg" />
            <div className="shimmer h-4 w-48 rounded-lg flex-1" />
            <div className="shimmer h-4 w-20 rounded-lg" />
            <div className="shimmer h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
