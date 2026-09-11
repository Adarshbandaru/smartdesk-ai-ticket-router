import { useState, useEffect, useCallback } from 'react';
import { getTickets, updateTicketStatus } from '../services/api';
import { Search, X, ChevronLeft, ChevronRight, Download, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';

const categoryBadgeColor = {
  Booking: { bg: 'rgba(99,102,241,0.1)', color: '#818CF8', border: 'rgba(99,102,241,0.25)' },
  Cancellation: { bg: 'rgba(239,68,68,0.08)', color: '#F87171', border: 'rgba(239,68,68,0.2)' },
  Refund: { bg: 'rgba(16,185,129,0.08)', color: '#34D399', border: 'rgba(16,185,129,0.2)' },
  Baggage: { bg: 'rgba(245,158,11,0.08)', color: '#FCD34D', border: 'rgba(245,158,11,0.2)' },
  'Technical Issue': { bg: 'rgba(59,130,246,0.08)', color: '#60A5FA', border: 'rgba(59,130,246,0.2)' },
  'Customer Service': { bg: 'rgba(139,92,246,0.08)', color: '#A78BFA', border: 'rgba(139,92,246,0.2)' },
};

const CategoryBadge = ({ value }) => {
  const cfg = categoryBadgeColor[value] || { bg: 'rgba(255,255,255,0.04)', color: '#A1A1AA', border: 'rgba(255,255,255,0.1)' };
  return (
    <span
      className="badge"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      {value}
    </span>
  );
};

const timeAgo = (dateStr) => {
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
};

// Ticket Detail Drawer
const TicketDrawer = ({ ticket, onClose, onStatusUpdate }) => {
  if (!ticket) return null;
  const confidence = ((ticket.confidence || 0) * 100).toFixed(1);
  const confColor = ticket.confidence >= 0.85 ? '#10B981' : ticket.confidence >= 0.6 ? '#F59E0B' : '#EF4444';

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
      style={{ width: 400, background: '#111111', borderLeft: '1px solid #27272A', boxShadow: '-16px 0 48px rgba(0,0,0,0.5)' }}
    >
      {/* Drawer header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#27272A' }}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] text-zinc-500">#{ticket.id}</span>
          <StatusBadge type="status" value={ticket.status} />
        </div>
        <button className="btn-icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Title + description */}
        <div className="px-4 py-4 border-b" style={{ borderColor: '#1C1C1F' }}>
          <h3 className="text-[15px] font-semibold text-zinc-100 leading-snug mb-2">{ticket.title}</h3>
          <p className="text-[13px] text-zinc-400 leading-relaxed">{ticket.description}</p>
        </div>

        {/* Ticket info */}
        <div className="px-4 py-3 border-b" style={{ borderColor: '#1C1C1F' }}>
          <p className="label mb-2.5">Ticket Information</p>
          <div className="space-y-2">
            {[
              { label: 'Category', value: <CategoryBadge value={ticket.category} /> },
              { label: 'Priority', value: <StatusBadge type="priority" value={ticket.priority} /> },
              { label: 'Root Cause', value: <span className="text-[13px] text-zinc-300">{ticket.root_cause}</span> },
              { label: 'Assigned Team', value: <span className="text-[13px] text-zinc-300">{ticket.assigned_team}</span> },
              { label: 'Created', value: <span className="text-[12px] text-zinc-500">{ticket.created_at ? timeAgo(ticket.created_at) : '—'}</span> },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <span className="text-[12px] text-zinc-500">{label}</span>
                {value}
              </div>
            ))}
          </div>
        </div>

        {/* AI Confidence */}
        <div className="px-4 py-3 border-b" style={{ borderColor: '#1C1C1F' }}>
          <p className="label mb-2.5">AI Confidence</p>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="progress-bar-track flex-1">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{ background: confColor }}
              />
            </div>
            <span className="text-[13px] font-semibold tabular-nums" style={{ color: confColor }}>
              {confidence}%
            </span>
          </div>
          <p className="text-[11px] text-zinc-600">Based on TF-IDF + XGBoost ensemble model v1.4</p>
        </div>

        {/* Processing time */}
        <div className="px-4 py-3 border-b" style={{ borderColor: '#1C1C1F' }}>
          <p className="label mb-2.5">Processing</p>
          <div className="flex items-center gap-3">
            <span
              className="badge"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', borderColor: 'rgba(99,102,241,0.25)' }}
            >
              {(ticket.processing_time || 0).toFixed(0)}ms processing
            </span>
            <span className="badge badge-success">Auto-routed</span>
          </div>
        </div>

        {/* Status update */}
        <div className="px-4 py-3">
          <p className="label mb-2.5">Update Status</p>
          <div className="grid grid-cols-2 gap-2">
            {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
              <button
                key={s}
                onClick={() => onStatusUpdate(ticket.id, s)}
                className="py-1.5 rounded-[6px] text-[12px] font-medium transition-all"
                style={ticket.status === s
                  ? { background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)' }
                  : { background: '#1C1C1F', color: '#A1A1AA', border: '1px solid #27272A' }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Filter select
const FilterSelect = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-base pl-3 pr-7 py-1.5 text-[12px] appearance-none cursor-pointer min-w-[120px]"
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#52525B' }} />
  </div>
);

const Inbox = () => {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ priority: '', category: '', status: '' });
  const [page, setPage] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const limit = 15;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { skip: page * limit, limit, search: search || undefined };
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      const data = await getTickets(params);
      setTickets(data.tickets || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    const debounce = setTimeout(fetchTickets, 300);
    return () => clearTimeout(debounce);
  }, [fetchTickets]);

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus);
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  const totalPages = Math.ceil(total / limit);

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Team', 'Confidence', 'Created'];
    const rows = tickets.map(t => [
      t.id, `"${t.title}"`, t.category, t.priority, t.status, t.assigned_team,
      ((t.confidence || 0) * 100).toFixed(1) + '%', t.created_at || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'tickets.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 52px)' }}>
      {/* Toolbar */}
      <div
        className="px-5 py-3 flex flex-wrap items-center gap-2 shrink-0"
        style={{ borderBottom: '1px solid #27272A', background: '#09090B' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-[280px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#52525B' }} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="input-base w-full pl-8 pr-3 py-1.5 text-[13px]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <FilterSelect
            value={filters.priority}
            onChange={(v) => { setFilters(f => ({ ...f, priority: v })); setPage(0); }}
            options={['Critical', 'High', 'Medium', 'Low']}
            placeholder="Priority"
          />
          <FilterSelect
            value={filters.category}
            onChange={(v) => { setFilters(f => ({ ...f, category: v })); setPage(0); }}
            options={['Booking', 'Cancellation', 'Refund', 'Baggage', 'Technical Issue', 'Customer Service']}
            placeholder="Category"
          />
          <FilterSelect
            value={filters.status}
            onChange={(v) => { setFilters(f => ({ ...f, status: v })); setPage(0); }}
            options={['Open', 'In Progress', 'Resolved', 'Closed']}
            placeholder="Status"
          />
          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setFilters({ priority: '', category: '', status: '' }); setPage(0); }}
              className="flex items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-300 px-2 py-1.5 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] text-zinc-500 tabular-nums">{total} tickets</span>
          <button onClick={exportCSV} className="btn-ghost py-1.5 text-[12px]">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <LoadingSkeleton rows={12} />
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-10 h-10 rounded-[8px] flex items-center justify-center mb-3" style={{ background: '#1C1C1F', border: '1px solid #27272A' }}>
              <Search className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-[14px] font-medium text-zinc-400">No tickets found</p>
            <p className="text-[13px] text-zinc-600 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Team</th>
                <th>Confidence</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, i) => (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.015 }}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    cursor: 'pointer',
                    background: selectedTicket?.id === ticket.id ? 'rgba(99,102,241,0.06)' : undefined,
                  }}
                >
                  <td>
                    <span className="font-mono text-[11px] text-zinc-500">#{ticket.id}</span>
                  </td>
                  <td>
                    <span className="text-[13px] text-zinc-200 font-medium" style={{ display: 'block', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ticket.title}
                    </span>
                  </td>
                  <td><CategoryBadge value={ticket.category} /></td>
                  <td><StatusBadge type="priority" value={ticket.priority} /></td>
                  <td><StatusBadge type="status" value={ticket.status} /></td>
                  <td className="text-[12px]" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.assigned_team}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar-track" style={{ width: 44 }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${(ticket.confidence || 0) * 100}%`,
                            background: (ticket.confidence || 0) >= 0.85 ? '#10B981' : (ticket.confidence || 0) >= 0.6 ? '#F59E0B' : '#EF4444'
                          }}
                        />
                      </div>
                      <span className="text-[11px] tabular-nums text-zinc-500">
                        {((ticket.confidence || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="text-[12px] text-zinc-600 tabular-nums whitespace-nowrap">
                    {ticket.created_at ? timeAgo(ticket.created_at) : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="px-5 py-2.5 flex items-center justify-between shrink-0"
          style={{ borderTop: '1px solid #27272A', background: '#09090B' }}
        >
          <p className="text-[12px] text-zinc-500">
            {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-ghost py-1 px-2 text-[12px] disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="w-7 h-7 rounded-[4px] text-[12px] font-medium transition-all"
                style={page === i
                  ? { background: '#6366F1', color: '#fff' }
                  : { color: '#71717A' }
                }
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn-ghost py-1 px-2 text-[12px] disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-over drawer */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setSelectedTicket(null)}
            />
            <TicketDrawer
              ticket={selectedTicket}
              onClose={() => setSelectedTicket(null)}
              onStatusUpdate={handleStatusUpdate}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inbox;
