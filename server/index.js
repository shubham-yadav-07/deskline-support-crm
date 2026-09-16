import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './db.js';
import { generateTicketId, isValidEmail } from './utils.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const VALID_STATUSES = ['Open', 'In Progress', 'Closed'];
const VALID_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];
const VALID_CHANNELS = ['Email', 'Chat', 'Phone', 'Social'];

// --- Helpers -------------------------------------------------------------

function getTicketWithNotes(ticket_id) {
  const ticket = db.prepare(`SELECT * FROM tickets WHERE ticket_id = ?`).get(ticket_id);
  if (!ticket) return null;
  const notes = db
    .prepare(`SELECT id, note_text, created_at FROM notes WHERE ticket_id = ? ORDER BY created_at DESC`)
    .all(ticket_id);
  return { ...ticket, notes };
}

// --- Routes ----------------------------------------------------------------

// POST /api/tickets — create a ticket
app.post('/api/tickets', (req, res) => {
  try {
    const { customer_name, customer_email, subject, description, priority, channel } = req.body;

    if (!customer_name?.trim() || !customer_email?.trim() || !subject?.trim() || !description?.trim()) {
      return res.status(400).json({ error: 'customer_name, customer_email, subject, and description are required.' });
    }
    if (!isValidEmail(customer_email)) {
      return res.status(400).json({ error: 'customer_email is not a valid email address.' });
    }

    const finalPriority = VALID_PRIORITIES.includes(priority) ? priority : 'Normal';
    const finalChannel = VALID_CHANNELS.includes(channel) ? channel : 'Email';
    const ticket_id = generateTicketId();

    const stmt = db.prepare(`
      INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, priority, channel)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(ticket_id, customer_name.trim(), customer_email.trim(), subject.trim(), description.trim(), finalPriority, finalChannel);

    const created = db.prepare(`SELECT ticket_id, created_at FROM tickets WHERE ticket_id = ?`).get(ticket_id);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create ticket.' });
  }
});

// GET /api/tickets — list, search, filter
app.get('/api/tickets', (req, res) => {
  try {
    const { status, search, priority, channel } = req.query;
    let query = `SELECT ticket_id, customer_name, customer_email, subject, status, priority, channel, created_at, updated_at FROM tickets WHERE 1=1`;
    const params = [];

    if (status && VALID_STATUSES.includes(status)) {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (priority && VALID_PRIORITIES.includes(priority)) {
      query += ` AND priority = ?`;
      params.push(priority);
    }
    if (channel && VALID_CHANNELS.includes(channel)) {
      query += ` AND channel = ?`;
      params.push(channel);
    }
    if (search?.trim()) {
      query += ` AND (ticket_id LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR subject LIKE ? OR description LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    query += ` ORDER BY created_at DESC`;
    const tickets = db.prepare(query).all(...params);
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tickets.' });
  }
});

// GET /api/tickets/stats — quick counts for dashboard header
app.get('/api/tickets/stats', (req, res) => {
  try {
    const rows = db.prepare(`SELECT status, COUNT(*) as count FROM tickets GROUP BY status`).all();
    const stats = { Open: 0, 'In Progress': 0, Closed: 0, total: 0 };
    rows.forEach((r) => { stats[r.status] = r.count; stats.total += r.count; });
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// GET /api/tickets/:ticket_id — single ticket with notes
app.get('/api/tickets/:ticket_id', (req, res) => {
  try {
    const ticket = getTicketWithNotes(req.params.ticket_id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ticket.' });
  }
});

// PUT /api/tickets/:ticket_id — update status/priority and optionally add a note
app.put('/api/tickets/:ticket_id', (req, res) => {
  try {
    const { ticket_id } = req.params;
    const { status, priority, notes } = req.body;

    const existing = db.prepare(`SELECT * FROM tickets WHERE ticket_id = ?`).get(ticket_id);
    if (!existing) return res.status(404).json({ error: 'Ticket not found.' });

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(', ')}` });
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `priority must be one of ${VALID_PRIORITIES.join(', ')}` });
    }

    const newStatus = status || existing.status;
    const newPriority = priority || existing.priority;

    db.prepare(`
      UPDATE tickets SET status = ?, priority = ?, updated_at = datetime('now') WHERE ticket_id = ?
    `).run(newStatus, newPriority, ticket_id);

    if (notes?.trim()) {
      db.prepare(`INSERT INTO notes (ticket_id, note_text) VALUES (?, ?)`).run(ticket_id, notes.trim());
    }

    const updated = db.prepare(`SELECT updated_at FROM tickets WHERE ticket_id = ?`).get(ticket_id);
    res.json({ success: true, updated_at: updated.updated_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update ticket.' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// --- Serve frontend build in production ------------------------------------
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Support CRM API running on port ${PORT}`);
});
