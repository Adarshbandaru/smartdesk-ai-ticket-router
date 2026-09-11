import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { predictTicket, createTicket } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, CheckCircle, RotateCcw, Zap, Users, Clock,
  AlertCircle, Search, Bot, ChevronRight, Tag, ShieldCheck
} from 'lucide-react';

const ConfidenceBar = ({ value, label, color }) => {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-zinc-500">{label}</span>
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ color: pct >= 85 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444' }}
        >
          {pct}%
        </span>
      </div>
      <div className="progress-bar-track">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start justify-between py-2 border-b" style={{ borderColor: '#1C1C1F' }}>
    <div className="flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-zinc-500 mt-0.5" strokeWidth={1.75} />}
      <span className="text-[12px] text-zinc-500">{label}</span>
    </div>
    <span className="text-[13px] font-medium text-zinc-200 text-right max-w-[180px]">{value}</span>
  </div>
);

const NewTicket = () => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [ticketSaved, setTicketSaved] = useState(false);

  const descValue = watch('description', '');
  const maxChars = 1000;

  const onSubmit = async (data) => {
    setLoading(true);
    setPrediction(null);
    setTicketSaved(false);
    try {
      const result = await predictTicket(data.title, data.description);
      setPrediction({ ...result, originalData: data });
    } catch (error) {
      console.error('Prediction failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await createTicket({
        title: prediction.originalData.title,
        description: prediction.originalData.description,
        category: prediction.category,
        priority: prediction.priority,
        root_cause: prediction.root_cause,
        assigned_team: prediction.assigned_team,
        confidence: prediction.category_confidence,
        processing_time: prediction.processing_time_ms,
      });
      setTicketSaved(true);
      setTimeout(() => { setPrediction(null); setTicketSaved(false); reset(); }, 2500);
    } catch (error) {
      console.error('Failed to save ticket', error);
    }
  };

  const handleReset = () => { setPrediction(null); setTicketSaved(false); reset(); };

  const priorityColor = {
    Critical: '#EF4444', High: '#F97316', Medium: '#F59E0B', Low: '#22C55E'
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-[22px] font-bold text-zinc-100 tracking-tight">New Ticket</h2>
        <p className="text-[13px] text-zinc-500 mt-0.5">Submit a support ticket — AI will classify and route it instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Submission form */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: '#27272A' }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-[4px] flex items-center justify-center" style={{ background: '#6366F1' }}>
                <Send className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-[14px] font-semibold text-zinc-100">Ticket Details</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="input-base w-full px-3 py-2"
                placeholder="e.g. Unable to complete booking for NYC flight"
              />
              {errors.title && (
                <p className="text-[11px] text-red-400 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[12px] font-medium text-zinc-400">
                  Description <span className="text-red-500">*</span>
                </label>
                <span
                  className="text-[11px] tabular-nums"
                  style={{ color: descValue.length > maxChars * 0.9 ? '#F59E0B' : '#52525B' }}
                >
                  {descValue.length}/{maxChars}
                </span>
              </div>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={8}
                maxLength={maxChars}
                className="input-base w-full px-3 py-2 resize-none"
                placeholder="Describe the issue in detail. Include relevant information such as booking reference, flight number, dates..."
              />
              {errors.description && (
                <p className="text-[11px] text-red-400 mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Attachment hint */}
            <div
              className="flex items-center justify-center gap-2 py-3 rounded-[6px] text-[12px] text-zinc-500 cursor-pointer transition-colors"
              style={{ border: '1px dashed #27272A' }}
            >
              <span>📎</span>
              <span>Drag & drop attachments or click to browse</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing via AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze & Route Ticket
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: AI Prediction results */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {prediction ? (
              <motion.div
                key="prediction"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="card overflow-hidden"
              >
                {/* Header stripe */}
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#27272A' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-[4px] flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                      <Zap className="w-3 h-3 text-indigo-400" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-zinc-100">AI Triage Result</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="badge badge-neutral text-[10px]">
                      {prediction.processing_time_ms}ms
                    </span>
                    <span
                      className="badge text-[10px]"
                      style={{
                        background: `${priorityColor[prediction.priority]}15`,
                        color: priorityColor[prediction.priority],
                        borderColor: `${priorityColor[prediction.priority]}30`,
                      }}
                    >
                      {prediction.priority}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Confidence bars */}
                  <div>
                    <p className="label mb-2.5">Confidence Scores</p>
                    <div className="space-y-2.5">
                      <ConfidenceBar value={prediction.category_confidence} label="Category" color="#6366F1" />
                      <ConfidenceBar value={prediction.priority_confidence} label="Priority" color="#F59E0B" />
                      <ConfidenceBar value={prediction.root_cause_confidence} label="Root Cause" color="#10B981" />
                    </div>
                  </div>

                  {/* Info grid */}
                  <div>
                    <p className="label mb-2">Prediction Details</p>
                    <div>
                      <InfoRow label="Category" value={prediction.category} icon={Tag} />
                      <InfoRow label="Root Cause" value={prediction.root_cause} icon={AlertCircle} />
                      <InfoRow label="Assigned Team" value={prediction.assigned_team} icon={Users} />
                      <InfoRow label="Suggested SLA" value={prediction.suggested_sla} icon={Clock} />
                      <InfoRow label="Model Version" value="v1.4" icon={Bot} />
                    </div>
                  </div>

                  {/* LIME explanation */}
                  {prediction.lime_explanation?.highlighted_text?.length > 0 && (
                    <div>
                      <p className="label mb-2 flex items-center gap-1.5">
                        <Search className="w-3 h-3" />
                        Explainable AI (LIME)
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {prediction.lime_explanation.highlighted_text.map(([word, score], idx) => (
                          <motion.span
                            key={idx}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + idx * 0.04 }}
                            className="badge"
                            style={score > 0
                              ? { background: 'rgba(16,185,129,0.1)', color: '#10B981', borderColor: 'rgba(16,185,129,0.25)' }
                              : { background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderColor: 'rgba(239,68,68,0.25)' }
                            }
                          >
                            {word} <span className="opacity-70">({score > 0 ? '+' : ''}{score.toFixed(2)})</span>
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleApprove}
                      disabled={ticketSaved}
                      className="flex-1 py-2 rounded-[6px] text-[13px] font-semibold flex items-center justify-center gap-2 transition-all"
                      style={ticketSaved
                        ? { background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }
                        : { background: '#F4F4F5', color: '#09090B', border: 'none' }
                      }
                    >
                      {ticketSaved ? (
                        <><CheckCircle className="w-4 h-4" /> Ticket Created!</>
                      ) : (
                        <><ShieldCheck className="w-4 h-4" /> Approve & Create</>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="btn-ghost px-3 py-2"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card min-h-[500px] flex flex-col items-center justify-center text-center p-8"
              >
                <div
                  className="w-12 h-12 rounded-[10px] flex items-center justify-center mb-4"
                  style={{ background: '#1C1C1F', border: '1px solid #27272A' }}
                >
                  <Bot className="w-6 h-6 text-zinc-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-semibold text-zinc-300 mb-1.5">Awaiting Input</h3>
                <p className="text-[13px] text-zinc-500 max-w-[240px] leading-relaxed">
                  Fill in the ticket details on the left. The AI will classify, prioritize, and route it instantly.
                </p>
                <div className="mt-5 flex items-center gap-2 text-[11px] text-zinc-600">
                  <span>Powered by</span>
                  <span className="font-semibold text-zinc-500">TF-IDF + XGBoost + LIME</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NewTicket;
