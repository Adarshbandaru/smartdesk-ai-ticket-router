import { useState, useEffect } from 'react';
import { getFeedbackQueue } from '../services/api';
import { RefreshCw, ArrowRight, MessageSquare, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';

const FeedbackQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await getFeedbackQueue();
      setQueue(data);
    } catch (error) {
      console.error("Failed to fetch feedback queue", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      {/* Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{queue.length}</p>
              <p className="text-xs text-slate-400">Pending Reviews</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">—</p>
              <p className="text-xs text-slate-400">Processed Today</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">v1.4</p>
              <p className="text-xs text-slate-400">Current Model</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Queue Table */}
      <GlassCard className="!p-0 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Feedback Queue</h2>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity gradient-glow">
            <RefreshCw className="w-3.5 h-3.5" />
            Retrain Models
          </button>
        </div>

        {queue.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Queue is empty"
            description="All predictions are on point! No corrections needed."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/5">
                  <th className="px-5 py-3 font-semibold">Ticket</th>
                  <th className="px-5 py-3 font-semibold">Predicted</th>
                  <th className="px-5 py-3 font-semibold"></th>
                  <th className="px-5 py-3 font-semibold">Actual</th>
                  <th className="px-5 py-3 font-semibold">Comments</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {queue.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-slate-200">#{item.ticket_id}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium">
                        {item.predicted_category}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                        {item.actual_category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 max-w-[200px] truncate">{item.comments || '—'}</td>
                    <td className="px-5 py-4">
                      <button className="px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-medium hover:bg-indigo-500/25 transition-colors border border-indigo-500/20">
                        Approve
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default FeedbackQueue;
