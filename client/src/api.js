const BASE = import.meta.env.VITE_API_URL || '/api';

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

export const api = {
  listTickets: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    return fetch(`${BASE}/tickets?${qs}`).then(handle);
  },
  getTicket: (ticketId) => fetch(`${BASE}/tickets/${ticketId}`).then(handle),
  createTicket: (payload) =>
    fetch(`${BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handle),
  updateTicket: (ticketId, payload) =>
    fetch(`${BASE}/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handle),
  getStats: () => fetch(`${BASE}/tickets/stats`).then(handle),
};
