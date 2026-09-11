const LoadingSkeleton = ({ rows = 5, type = 'table' }) => {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-7 w-14 rounded" />
            <div className="skeleton h-2.5 w-28 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="card p-5 space-y-4">
        <div className="skeleton h-4 w-36 rounded" />
        <div className="skeleton h-56 w-full rounded" />
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className="p-6 space-y-6">
        <div className="skeleton h-5 w-48 rounded" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-2">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-6 w-10 rounded" />
            </div>
          ))}
        </div>
        <div className="card overflow-hidden">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b" style={{ borderColor: '#1C1C1F' }}>
              <div className="skeleton h-3.5 w-10 rounded" />
              <div className="skeleton h-3.5 w-48 rounded flex-1" />
              <div className="skeleton h-5 w-16 rounded" />
              <div className="skeleton h-5 w-14 rounded" />
              <div className="skeleton h-3.5 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default table skeleton
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b" style={{ borderColor: '#27272A' }}>
        <div className="skeleton h-4 w-36 rounded" />
      </div>
      <div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3"
            style={{ borderBottom: '1px solid #1C1C1F' }}
          >
            <div className="skeleton h-3.5 w-10 rounded" />
            <div className="skeleton h-3.5 flex-1 rounded" />
            <div className="skeleton h-5 w-16 rounded" />
            <div className="skeleton h-5 w-16 rounded" />
            <div className="skeleton h-3.5 w-24 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
