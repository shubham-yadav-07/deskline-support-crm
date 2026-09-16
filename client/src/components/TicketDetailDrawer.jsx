import { useEffect, useState } from 'react';
import { api } from '../api';
import { StatusBadge } from './Badges';

function formatDate(iso) {
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const STATUS_OPTIONS = ['Open', 'In Progress', 'Closed'];

export default function TicketDetailDrawer({ ticketId, onClose, onUpdated }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getTicket(ticketId).then((t) => {
      if (cancelled) return;
      setTicket(t);
      setStatus(t.status);
      setLoading(false);
    }).catch((err) => setError(err.message));
    return () => { cancelled = true; };
  }, [ticketId]);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await api.updateTicket(ticketId, { status, notes: noteText.trim() || undefined });
      const refreshed = await api.getTicket(ticketId);
      setTicket(refreshed);
      setNoteText('');
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2 style={{ fontSize: 20, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{ticketId}</h2>
            {ticket && <div className="page-sub" style={{ marginTop: 4 }}><StatusBadge status={ticket.status} /></div>}
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {loading && <p className="page-sub">Loading ticket…</p>}
          {error && <div className="form-error">{error}</div>}

          {ticket && (
            <>
              <h3 style={{ fontSize: 19, marginBottom: 4 }}>{ticket.subject}</h3>
              <p className="page-sub" style={{ margin: 0 }}>
                Submitted by {ticket.customer_name} · {formatDate(ticket.created_at)}
              </p>

              <div className="detail-meta-grid">
                <div className="meta-item">
                  <div className="meta-label">Customer</div>
                  <div className="meta-value">{ticket.customer_name}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Email</div>
                  <div className="meta-value">{ticket.customer_email}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Priority</div>
                  <div className="meta-value">{ticket.priority}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Channel</div>
                  <div className="meta-value">{ticket.channel}</div>
                </div>
              </div>

              <div className="section-heading">Description</div>
              <div className="description-block">{ticket.description}</div>

              <div className="section-heading">Update status</div>
              <div className="status-control-row">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    className={`status-pill-btn ${status === s ? `selected-${s.replace(' ', '')}` : ''}`}
                    onClick={() => setStatus(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="section-heading">Add a note</div>
              <textarea
                className="field-textarea"
                placeholder="Add an internal note or update for this ticket..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />

              <div className="form-actions">
                <button className="btn btn-ghost" onClick={onClose}>Close</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>

              {ticket.notes.length > 0 && (
                <>
                  <div className="section-heading">Note history</div>
                  {ticket.notes.map((n) => (
                    <div key={n.id} className="note-item">
                      <div className="note-time">{formatDate(n.created_at)}</div>
                      {n.note_text}
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
