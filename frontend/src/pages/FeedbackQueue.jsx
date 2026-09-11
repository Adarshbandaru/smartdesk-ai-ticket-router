import { useState, useEffect } from 'react';
import { getFeedbackQueue, submitFeedback } from '../services/api';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, RotateCcw, GitBranch, Clock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/GlassCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const categoryOptions = ['Booking', 'Cancellation', 'Refund', 'Baggage', 'Technical Issue', 'Customer Service'];
const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];

const priorityColor = { Critical: '#EF4444', High: '#F97316', Medium: '#F59E0B', Low: '#22C55E' };

const SelectDropdown = ({ value, onChange, options, label }) => (
  <div>
    <p className="label mb-1">{label}</p>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base pl-3 pr-7 py-1.5 text-[12px] w-full appearance-none"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#52525B' }} />
    </div>
  </div>
);

const FeedbackCard = ({ item, index, onApprove, onReject, onQueue }) => {
  const [actualCategory, setActualCategory] = useState(item.actual_category || item.predicted_category);
  const [actualPriority, setActualPriority] = useState(item.actual_priority || 'Medium');
  const [comment, setComment] = useState(item.comments || '');
  const [acted, setActed] = useState(false);
  const [action, setAction] = useState(null);

  const handleAction = (type) => {
    setActed(true);
    setAction(type);
    if (type === 'accept') onApprove(item.id, actualCategory, actualPriority);
    else if (type === 'reject') onReject(item.id);
    else if (type === 'queue') onQueue(item.id);
  };

  const predColor = priorityColor[item.predicted_priority] || '#71717A';
  const actColor = priorityColor[actualPriority] || '#71717A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: acted ? 0.4 : 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="card overflow-hidden"
    >
      {/* Card header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#27272A' }}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-zinc-500">Ticket #{item.ticket_id}</span>
          {acted && (
            <span
              className="badge text-[10px]"
              style={
                action === 'accept'
                  ? { background: 'rgba(16,185,129,0.1)', color: '#10B981', borderColor: 'rgba(16,185,129,0.25)' }
                  : action === 'reject'
                  ? { background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderColor: 'rgba(239,68,68,0.25)' }
                  : { background: 'rgba(99,102,241,0.1)', color: '#818CF8', borderColor: 'rgba(99,102,241,0.25)' }
              }
            >
              {action === 'accept' ? '✓ Accepted' : action === 'reject' ? '✕ Rejected' : '⟳ Queued'}
            </span>
          )}
        </div>
        <span className="text-[11px] text-zinc-600">
          {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Prediction vs Actual */}
        <div className="space-y-3">
          {/* Category comparison */}
          <div>
            <p className="label mb-2">Category Correction</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[10px] text-zinc-600 mb-1">AI Predicted</p>
                <span
                  className="badge"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', borderColor: 'rgba(239,68,68,0.25)' }}
                >
                  {item.predicted_category}
                </span>
              </div>
              <span className="text-zinc-600 text-[12px]">→</span>
              <div className="flex-1">
                <p className="text-[10px] text-zinc-600 mb-1">Correct Label</p>
                <span
                  className="badge"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399', borderColor: 'rgba(16,185,129,0.25)' }}
                >
                  {actualCategory}
                </span>
              </div>
            </div>
          </div>

          {/* Priority comparison */}
          <div>
            <p className="label mb-2">Priority Correction</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[10px] text-zinc-600 mb-1">AI Predicted</p>
                <span
                  className="badge text-[10px]"
                  style={{ background: `${predColor}15`, color: predColor, borderColor: `${predColor}30` }}
                >
                  {item.predicted_priority}
                </span>
              </div>
              <span className="text-zinc-600 text-[12px]">→</span>
              <div className="flex-1">
                <p className="text-[10px] text-zinc-600 mb-1">Correct</p>
                <span
                  className="badge text-[10px]"
                  style={{ background: `${actColor}15`, color: actColor, borderColor: `${actColor}30` }}
                >
                  {actualPriority}
                </span>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <p className="label mb-1.5">Agent Comment</p>
            <p className="text-[12px] text-zinc-400 leading-relaxed">
              {comment || <span className="text-zinc-600 italic">No comment provided</span>}
            </p>
          </div>
        </div>

        {/* Right: Editable dropdowns + actions */}
        <div className="space-y-3">
          <SelectDropdown
            value={actualCategory}
            onChange={setActualCategory}
            options={categoryOptions}
            label="Set Correct Category"
          />
          <SelectDropdown
            value={actualPriority}
            onChange={setActualPriority}
            options={priorityOptions}
            label="Set Correct Priority"
          />
          <div>
            <p className="label mb-1.5">Add Note (optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="Add a note about this correction..."
              className="input-base w-full px-3 py-2 text-[12px] resize-none"
            />
          </div>

          {/* Action buttons */}
          {!acted ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleAction('accept')}
                className="flex-1 py-1.5 rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Accept
              </button>
              <button
                onClick={() => handleAction('reject')}
                className="flex-1 py-1.5 rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
              <button
                onClick={() => handleAction('queue')}
                className="py-1.5 px-2.5 rounded-[6px] text-[12px] font-semibold flex items-center gap-1.5 transition-all"
                style={{ background: 'rgba(99,102,241,0.08)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}
                title="Queue for Retraining"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center justify-center gap-2 py-1.5 rounded-[6px] text-[12px]"
              style={{ background: '#1C1C1F', color: '#52525B', border: '1px solid #27272A' }}
            >
              <span>Action recorded</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const FeedbackQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrained, setRetrained] = useState(0);
  const [accepted, setAccepted] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [queued, setQueued] = useState(0);

  useEffect(() => { fetchQueue(); }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await getFeedbackQueue();
      setQueue(data);
    } catch (error) {
      console.error('Failed to fetch feedback queue', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id, cat, pri) => setAccepted(a => a + 1);
  const handleReject = (id) => setRejected(r => r + 1);
  const handleQueue = (id) => setQueued(q => q + 1);

  const stats = [
    { label: 'Pending Review', value: queue.length, icon: AlertTriangle, color: '#F59E0B' },
    { label: 'Accepted Today', value: accepted, icon: CheckCircle, color: '#10B981' },
    { label: 'Rejected Today', value: rejected, icon: XCircle, color: '#EF4444' },
    { label: 'Retraining Queue', value: queued, icon: RotateCcw, color: '#6366F1' },
  ];

  if (loading) return <LoadingSkeleton type="page" rows={4} />;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-zinc-100 tracking-tight">Feedback Queue</h2>
          <p className="text-[13px] text-zinc-500 mt-0.5">Human-in-the-Loop review of incorrect AI predictions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11px] font-medium" style={{ background: '#1C1C1F', border: '1px solid #27272A', color: '#818CF8' }}>
            <GitBranch className="w-3.5 h-3.5" />
            <span>v1.4 Active</span>
          </div>
          <button className="btn-primary text-[12px] py-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Trigger Retrain
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5" style={{ color: s.color }} strokeWidth={2} />
                <span className="text-[12px] text-zinc-500">{s.label}</span>
              </div>
              <div className="metric-value text-[24px]">{s.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Feedback cards */}
      {queue.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-10 h-10 rounded-[8px] flex items-center justify-center mb-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-[15px] font-semibold text-zinc-300 mb-1">Queue is clear</p>
          <p className="text-[13px] text-zinc-600">All AI predictions are on point. No corrections needed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-[13px] text-zinc-500">{queue.length} items pending review</p>
          </div>
          {queue.map((item, i) => (
            <FeedbackCard
              key={item.id}
              item={item}
              index={i}
              onApprove={handleApprove}
              onReject={handleReject}
              onQueue={handleQueue}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackQueue;
