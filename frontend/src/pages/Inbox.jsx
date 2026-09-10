import { useState, useEffect, useCallback } from 'react';
import { getTickets, updateTicketStatus } from '../services/api';
import { Search, Filter, X, ChevronLeft, ChevronRight, Eye, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const Inbox = () => {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ priority: '', category: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);
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
      console.error("Failed to fetch tickets", error);
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
      console.error("Failed to update status", error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex gap-6 h-full">
      {/* Main Table */}
      <div className="flex-1 flex flex-col min-w-0">
        <GlassCard className="!p-0 overflow-hidden flex flex-col flex-1">
          {/* Header & Controls */}
          <div className="p-4 border-b border-white/5 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showFilters ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' : 'glass-input text-slate-300 hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {Object.values(filters).filter(Boolean).length > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-white/5"
              >
                <div className="p-4 flex flex-wrap gap-3">
                  <select
                    value={filters.priority}
                    onChange={(e) => { setFilters(f => ({ ...f, priority: e.target.value })); setPage(0); }}
                    className="glass-input px-3 py-2 rounded-xl text-sm min-w-[140px]"
                  >
                    <option value="">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value })); setPage(0); }}
                    className="glass-input px-3 py-2 rounded-xl text-sm min-w-[140px]"
                  >
                    <option value="">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <select
                    value={filters.category}
                    onChange={(e) => { setFilters(f => ({ ...f, category: e.target.value })); setPage(0); }}
                    className="glass-input px-3 py-2 rounded-xl text-sm min-w-[140px]"
                  >
                    <option value="">All Categories</option>
                    <option value="Booking">Booking</option>
                    <option value="Cancellation">Cancellation</option>
                    <option value="Refund">Refund</option>
                    <option value="Baggage">Baggage</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Customer Service">Customer Service</option>
                  </select>
                  {Object.values(filters).some(Boolean) && (
                    <button
                      onClick={() => { setFilters({ priority: '', category: '', status: '' }); setPage(0); }}
                      className="text-xs text-slate-400 hover:text-white px-3 py-2"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table */}
          {loading ? <LoadingSkeleton rows={8} /> : (
            <div className="flex-1 overflow-auto">
              {tickets.length === 0 ? (
                <EmptyState title="No tickets found" description="Try adjusting your search or filters." />
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-10">
                    <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-dark-800/80 backdrop-blur-sm border-b border-white/5">
                      <th className="px-5 py-3 font-semibold">ID</th>
                      <th className="px-5 py-3 font-semibold">Title</th>
                      <th className="px-5 py-3 font-semibold">Category</th>
                      <th className="px-5 py-3 font-semibold">Priority</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Team</th>
                      <th className="px-5 py-3 font-semibold w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {tickets.map((ticket, i) => (
                      <motion.tr
                        key={ticket.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`cursor-pointer transition-colors ${
                          selectedTicket?.id === ticket.id ? 'bg-indigo-500/[0.06]' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">#{ticket.id}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-200 font-medium max-w-[240px] truncate">{ticket.title}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-400">{ticket.category}</td>
                        <td className="px-5 py-3.5"><StatusBadge type="priority" value={ticket.priority} /></td>
                        <td className="px-5 py-3.5"><StatusBadge type="status" value={ticket.status} /></td>
                        <td className="px-5 py-3.5 text-xs text-slate-400">{ticket.assigned_team}</td>
                        <td className="px-5 py-3.5">
                          <Eye className="w-4 h-4 text-slate-500 hover:text-indigo-400 transition-colors" />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg hover:bg-white/5 text-slate-400 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      page === i ? 'gradient-accent text-white' : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg hover:bg-white/5 text-slate-400 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0 overflow-hidden"
          >
            <GlassCard className="h-full !p-0 overflow-auto">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Ticket #{selectedTicket.id}</h3>
                <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <h4 className="text-base font-semibold text-white mb-1">{selectedTicket.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{selectedTicket.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Category</p>
                    <p className="text-sm font-medium text-slate-200">{selectedTicket.category}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Root Cause</p>
                    <p className="text-sm font-medium text-slate-200">{selectedTicket.root_cause}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">Priority</p>
                  <StatusBadge type="priority" value={selectedTicket.priority} />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">Status</p>
                  <StatusBadge type="status" value={selectedTicket.status} />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">Assigned Team</p>
                  <p className="text-sm font-medium text-slate-200">{selectedTicket.assigned_team}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">AI Confidence</p>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-accent"
                      style={{ width: `${(selectedTicket.confidence || 0) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{((selectedTicket.confidence || 0) * 100).toFixed(1)}%</p>
                </div>

                {/* Status Update Actions */}
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(selectedTicket.id, s)}
                        disabled={selectedTicket.status === s}
                        className={`text-xs font-medium py-2 rounded-lg transition-all ${
                          selectedTicket.status === s
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-white/[0.03] text-slate-300 border border-white/5 hover:bg-white/[0.06]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inbox;
