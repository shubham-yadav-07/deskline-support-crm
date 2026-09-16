export function StatusBadge({ status }) {
  const cls = status === 'Open' ? 'badge-open' : status === 'In Progress' ? 'badge-progress' : 'badge-closed';
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

export function PriorityTag({ priority }) {
  return <span className={`priority-tag priority-${priority}`}>{priority}</span>;
}
