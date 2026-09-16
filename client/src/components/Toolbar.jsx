function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function Toolbar({ search, setSearch, priority, setPriority, channel, setChannel }) {
  return (
    <div className="toolbar">
      <div className="search-input-wrap">
        <SearchIcon />
        <input
          className="search-input"
          placeholder="Search by name, ID, email, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <select className="select-filter" value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="">All priorities</option>
        <option value="Urgent">Urgent</option>
        <option value="High">High</option>
        <option value="Normal">Normal</option>
        <option value="Low">Low</option>
      </select>
      <select className="select-filter" value={channel} onChange={(e) => setChannel(e.target.value)}>
        <option value="">All channels</option>
        <option value="Email">Email</option>
        <option value="Chat">Chat</option>
        <option value="Phone">Phone</option>
        <option value="Social">Social</option>
      </select>
    </div>
  );
}
