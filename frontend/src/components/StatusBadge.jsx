const priorityConfig = {
  Critical: 'badge-critical',
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
};

const priorityDot = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#F59E0B',
  Low: '#22C55E',
};

const statusConfig = {
  Open: 'badge-info',
  'In Progress': 'badge-medium',
  Resolved: 'badge-success',
  Closed: 'badge-neutral',
};

const statusDot = {
  Open: '#3B82F6',
  'In Progress': '#F59E0B',
  Resolved: '#10B981',
  Closed: '#52525B',
};

const StatusBadge = ({ type = 'status', value }) => {
  const badgeClass = type === 'priority'
    ? priorityConfig[value] || 'badge-neutral'
    : statusConfig[value] || 'badge-neutral';

  const dotColor = type === 'priority'
    ? priorityDot[value]
    : statusDot[value];

  return (
    <span className={`badge ${badgeClass}`}>
      {dotColor && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: dotColor }}
        />
      )}
      {value}
    </span>
  );
};

export default StatusBadge;
