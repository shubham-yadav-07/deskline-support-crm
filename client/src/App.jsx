import { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import TicketTable from './components/TicketTable';
import NewTicketDrawer from './components/NewTicketDrawer';
import TicketDetailDrawer from './components/TicketDetailDrawer';
import { api } from './api';
import './styles.css';

function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function App() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [channel, setChannel] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [openTicketId, setOpenTicketId] = useState(null);
  const [toast, setToast] = useState('');

  const debouncedSearch = useDebounced(search, 300);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch || undefined,
        priority: priority || undefined,
        channel: channel || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      const data = await api.listTickets(params);
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, priority, channel, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await api.getStats();
      setStats(s);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function handleCreated(ticketId) {
    setShowNewTicket(false);
    fetchTickets();
    fetchStats();
    setToast(`Ticket ${ticketId} created`);
    setOpenTicketId(ticketId);
  }

  function handleUpdated() {
    fetchTickets();
    fetchStats();
    setToast('Ticket updated');
  }

  return (
    <div className="app-shell">
      <Sidebar activeStatus={statusFilter} onSelect={setStatusFilter} stats={stats} />
      <main className="main">
        <div className="topbar">
          <div>
            <h1 className="page-title">
              {statusFilter === 'all' ? 'All tickets' : statusFilter}
            </h1>
            <div className="page-sub">
              {stats.total ?? '–'} total · {stats.Open ?? '–'} open · {stats.Closed ?? '–'} closed
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNewTicket(true)}>
            + New ticket
          </button>
        </div>

        <Toolbar
          search={search} setSearch={setSearch}
          priority={priority} setPriority={setPriority}
          channel={channel} setChannel={setChannel}
        />

        <TicketTable tickets={tickets} loading={loading} onOpen={setOpenTicketId} />
      </main>

      {showNewTicket && (
        <NewTicketDrawer onClose={() => setShowNewTicket(false)} onCreated={handleCreated} />
      )}

      {openTicketId && (
        <TicketDetailDrawer
          ticketId={openTicketId}
          onClose={() => setOpenTicketId(null)}
          onUpdated={handleUpdated}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
