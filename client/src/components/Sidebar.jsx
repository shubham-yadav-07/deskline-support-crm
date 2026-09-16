const STATUSES = [
  { key: 'all', label: 'All tickets' },
  { key: 'Open', label: 'Open' },
  { key: 'In Progress', label: 'In progress' },
  { key: 'Closed', label: 'Closed' },
];

export default function Sidebar({ activeStatus, onSelect, stats }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">Deskline</span>
      </div>
      <div>
        <div className="nav-section-label">Queue</div>
        <div className="status-nav">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              className={activeStatus === s.key ? 'active' : ''}
              onClick={() => onSelect(s.key)}
            >
              <span>{s.label}</span>
              <span className="count">
                {s.key === 'all' ? stats.total ?? '–' : stats[s.key] ?? '–'}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="sidebar-foot">
        Support ticketing system
        <br />
        built for daily queue triage.
      </div>
    </aside>
  );
}
