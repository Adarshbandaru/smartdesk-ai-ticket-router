import { useState, useEffect } from 'react';
import { getModelMetrics, getDashboardMetrics, getModelHistory } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Brain, Target, Crosshair, Activity, TrendingUp, GitBranch, Clock } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3 shadow-2xl border border-white/10">
      <p className="text-xs font-semibold text-slate-300 mb-1">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
          <span className="text-xs text-slate-400 capitalize">{item.dataKey}:</span>
          <span className="text-sm font-bold text-white">{typeof item.value === 'number' ? (item.value * 100).toFixed(1) + '%' : item.value}</span>
        </div>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [modelMetrics, setModelMetrics] = useState(null);
  const [dashMetrics, setDashMetrics] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getModelMetrics(), getDashboardMetrics(), getModelHistory()])
      .then(([model, dash, history]) => {
        setModelMetrics(model);
        setDashMetrics(dash);
        // Map version history for chart (v1.0 to v1.4)
        const mapped = history.map(v => ({
          name: `v1.${v.version - 1}`,
          versionLabel: `v1.${v.version - 1}`,
          accuracy: v.accuracy,
          precision: v.precision,
          recall: v.recall,
          f1_score: v.f1_score,
          version: v.version,
          created_at: v.created_at,
        }));
        setHistoryData(mapped);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <LoadingSkeleton type="cards" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="chart" />
      </div>
    </div>
  );

  const latestVersion = historyData.length > 0 ? historyData[historyData.length - 1] : null;

  const metricCards = [
    { label: 'Accuracy', value: modelMetrics?.accuracy, color: '#6366f1', icon: Target },
    { label: 'Precision', value: modelMetrics?.precision, color: '#8b5cf6', icon: Crosshair },
    { label: 'Recall', value: modelMetrics?.recall, color: '#10b981', icon: Activity },
    { label: 'F1 Score', value: modelMetrics?.f1_score, color: '#f59e0b', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center gradient-glow">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Model Analytics</h2>
            <p className="text-xs text-slate-400">Model: {modelMetrics?.model_name} · Version {latestVersion ? latestVersion.versionLabel : 'v1.4'}</p>
          </div>
        </div>
      </div>

      {/* Metric Cards with Progress Rings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-5 hover-glow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4" style={{ color: metric.color }} />
                    <p className="text-xs font-medium text-slate-400">{metric.label}</p>
                  </div>
                  <h3 className="text-3xl font-bold text-white tabular-nums">
                    {(metric.value * 100).toFixed(1)}%
                  </h3>
                </div>
                <ProgressRing value={metric.value * 100} size={64} strokeWidth={5} color={metric.color} delay={300 + i * 150} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Performance History — from real API data */}
        <GlassCard>
          <h3 className="text-base font-semibold text-slate-100 mb-5">Model Performance History</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="precGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0.8, 1]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${(v*100).toFixed(0)}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2} fill="url(#accGrad)" dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="precision" stroke="#8b5cf6" strokeWidth={2} fill="url(#precGrad)" dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="recall" stroke="#10b981" strokeWidth={2} fill="url(#recGrad)" dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3">
            {[{ label: 'Accuracy', color: '#6366f1' }, { label: 'Precision', color: '#8b5cf6' }, { label: 'Recall', color: '#10b981' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-xs text-slate-400">{l.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Category Distribution */}
        <GlassCard>
          <h3 className="text-base font-semibold text-slate-100 mb-5">Category Distribution</h3>
          <div className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashMetrics?.charts.category_distribution || []}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {(dashMetrics?.charts.category_distribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-slate-300 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Ticket Distribution */}
        <GlassCard className="lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-100 mb-5">Team Ticket Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashMetrics?.charts.team_distribution || []} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="teamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <Bar dataKey="value" fill="url(#teamGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Model Version History Table */}
        <GlassCard className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              Version History
            </h3>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {historyData.slice().reverse().map((v, i) => {
              const isLatest = i === 0;
              return (
                <motion.div
                  key={v.version}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className={`px-5 py-3.5 flex items-center gap-3 ${isLatest ? 'bg-indigo-500/[0.06]' : 'hover:bg-white/[0.02]'} transition-colors`}
                >
                  {/* Version dot */}
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isLatest ? 'bg-indigo-400 ring-4 ring-indigo-500/20' : 'bg-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200">{v.versionLabel}</span>
                      {isLatest && (
                        <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase">Latest</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Acc: {(v.accuracy * 100).toFixed(1)}% · F1: {(v.f1_score * 100).toFixed(1)}%
                    </p>
                  </div>
                  {v.created_at && (
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Analytics;
