import { StatusBadge, PriorityTag } from './Badges';

function formatDate(iso) {
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function TicketTable({ tickets, loading, onOpen }) {
  if (loading) {
    return (
      <div className="ticket-table-wrap">
        <table className="ticket-table">
          <thead>
            <tr>
              <th>ID</th><th>Customer</th><th>Subject</th><th>Status</th><th>Priority</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="skeleton-row">
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j}><div className="skeleton-bar" style={{ width: `${50 + (j * 7) % 40}%` }} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="ticket-table-wrap">
        <div className="empty-state">
          <h3>No tickets here</h3>
          <p>Nothing matches this view right now. Try a different filter, or create a new ticket to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-table-wrap">
      <table className="ticket-table">
        <thead>
          <tr>
            <th>ID</th><th>Customer</th><th>Subject</th><th>Status</th><th>Priority</th><th>Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.ticket_id} onClick={() => onOpen(t.ticket_id)}>
              <td className="td-id">{t.ticket_id}</td>
              <td>
                <div className="td-name">{t.customer_name}</div>
                <div className="td-email">{t.customer_email}</div>
              </td>
              <td className="td-subject">{t.subject}</td>
              <td><StatusBadge status={t.status} /></td>
              <td><PriorityTag priority={t.priority} /></td>
              <td className="td-date">{formatDate(t.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
