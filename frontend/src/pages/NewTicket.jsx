import { useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { predictTicket, createTicket } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Clock, Users, Zap, Search, Send, Sparkles, RotateCcw } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import StatusBadge from '../components/StatusBadge';

const NewTicket = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useHookForm();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [ticketSaved, setTicketSaved] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setPrediction(null);
    setTicketSaved(false);
    try {
      const result = await predictTicket(data.title, data.description);
      setPrediction({ ...result, originalData: data });
    } catch (error) {
      console.error("Prediction failed", error);
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
        processing_time: prediction.processing_time_ms
      });
      setTicketSaved(true);
      setTimeout(() => {
        setPrediction(null);
        setTicketSaved(false);
        reset();
      }, 2500);
    } catch (error) {
      console.error("Failed to save ticket", error);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setTicketSaved(false);
    reset();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Submission Form */}
      <GlassCard className="!p-0 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Submit New Ticket</h2>
              <p className="text-xs text-slate-400">Our AI will classify, prioritize, and route it in milliseconds.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col p-6 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Ticket Title</label>
            <input
              {...register("title", { required: true })}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              placeholder="e.g. Cannot complete my booking for NYC"
            />
            {errors.title && <span className="text-red-400 text-xs mt-1.5 block">Title is required</span>}
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              {...register("description", { required: true })}
              rows="8"
              className="w-full h-full min-h-[180px] px-4 py-3 rounded-xl glass-input text-sm resize-none"
              placeholder="Please describe the issue in detail..."
            />
            {errors.description && <span className="text-red-400 text-xs mt-1.5 block">Description is required</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-accent hover:opacity-90 text-white font-semibold py-3.5 px-4 rounded-xl transition-all flex justify-center items-center gap-2 gradient-glow disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
      </GlassCard>

      {/* AI Prediction Results */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {prediction && (
            <motion.div
              key="prediction"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              {/* Gradient top bar */}
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">AI Triage Results</h3>
                      <p className="text-xs text-slate-400">Processed in {prediction.processing_time_ms}ms</p>
                    </div>
                  </div>
                  <StatusBadge type="priority" value={prediction.priority} />
                </div>

                {/* Confidence Rings */}
                <div className="flex items-center justify-around py-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <ProgressRing value={prediction.category_confidence * 100} color="#6366f1" label="Category" delay={200} />
                  <ProgressRing value={prediction.priority_confidence * 100} color="#8b5cf6" label="Priority" delay={400} />
                  <ProgressRing value={prediction.root_cause_confidence * 100} color="#a855f7" label="Root Cause" delay={600} />
                </div>

                {/* Category & Root Cause */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</p>
                    <p className="font-semibold text-slate-100">{prediction.category}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Root Cause</p>
                    <p className="font-semibold text-slate-100">{prediction.root_cause}</p>
                  </div>
                </div>

                {/* Routing & SLA */}
                <div className="p-4 rounded-xl bg-indigo-500/[0.07] border border-indigo-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">Assigned Team</p>
                    <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {prediction.assigned_team}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">Suggested SLA</p>
                    <p className="font-bold text-indigo-300 flex items-center gap-1.5 justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      {prediction.suggested_sla}
                    </p>
                  </div>
                </div>

                {/* LIME Explanation */}
                {prediction.lime_explanation?.highlighted_text?.length > 0 && (
                  <div className="pt-3 border-t border-white/5">
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-3">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      Explainable AI (LIME)
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {prediction.lime_explanation.highlighted_text.map(([word, score], idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + idx * 0.05 }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium border ${
                            score > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {word} ({score > 0 ? '+' : ''}{score.toFixed(2)})
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleApprove}
                    disabled={ticketSaved}
                    className={`flex-1 font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2 ${
                      ticketSaved 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-white text-dark-900 hover:bg-white/90'
                    }`}
                  >
                    {ticketSaved ? (
                      <><CheckCircle className="w-4 h-4" /> Ticket Created!</>
                    ) : "Approve & Create Ticket"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {!prediction && !loading && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full min-h-[500px] glass-card rounded-2xl flex flex-col items-center justify-center text-center p-8"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl gradient-accent gradient-glow flex items-center justify-center mb-5"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Awaiting Ticket Input</h3>
              <p className="text-sm text-slate-400 max-w-xs">Fill out the form and our AI will classify, prioritize, and route it in milliseconds.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NewTicket;
