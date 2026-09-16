import { useState } from 'react';
import { api } from '../api';

const initial = { customer_name: '', customer_email: '', subject: '', description: '', priority: 'Normal', channel: 'Email' };

export default function NewTicketDrawer({ onClose, onCreated }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.customer_name.trim() || !form.customer_email.trim() || !form.subject.trim() || !form.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.createTicket(form);
      onCreated(created.ticket_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2 style={{ fontSize: 20 }}>New ticket</h2>
            <div className="page-sub" style={{ marginTop: 2 }}>Log a new customer support request</div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="drawer-body">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Customer name</label>
                <input className="field-input" value={form.customer_name} onChange={update('customer_name')} placeholder="Jordan Reyes" />
              </div>
              <div className="field-group">
                <label className="field-label">Customer email</label>
                <input className="field-input" type="email" value={form.customer_email} onChange={update('customer_email')} placeholder="jordan@email.com" />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Subject</label>
              <input className="field-input" value={form.subject} onChange={update('subject')} placeholder="Order arrived damaged" />
            </div>

            <div className="field-group">
              <label className="field-label">Description</label>
              <textarea className="field-textarea" value={form.description} onChange={update('description')} placeholder="Describe the issue in detail..." />
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Priority</label>
                <select className="field-select" value={form.priority} onChange={update('priority')}>
                  <option>Low</option><option>Normal</option><option>High</option><option>Urgent</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Channel</label>
                <select className="field-select" value={form.channel} onChange={update('channel')}>
                  <option>Email</option><option>Chat</option><option>Phone</option><option>Social</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
