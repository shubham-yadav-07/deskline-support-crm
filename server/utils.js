import { db } from './db.js';

// Generates sequential, human-readable ticket IDs like TKT-001, TKT-002...
export function generateTicketId() {
  const row = db.prepare(`SELECT ticket_id FROM tickets ORDER BY id DESC LIMIT 1`).get();
  let next = 1;
  if (row?.ticket_id) {
    const match = row.ticket_id.match(/(\d+)$/);
    if (match) next = parseInt(match[1], 10) + 1;
  }
  return `TKT-${String(next).padStart(3, '0')}`;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
