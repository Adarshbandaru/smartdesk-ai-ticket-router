import { useState, useEffect } from 'react';
import { getModelMetrics, getDashboardMetrics } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Brain, Target, Crosshair, Activity, TrendingUp } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3 shadow-2xl border border-white/10">
      <p className="text-xs font-semibold text-slate-300 mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-sm font-bold text-white">{typeof item.value === 'number' ? (item.value * 100).toFixed(1) + '%' : item.value}</p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [modelMetrics, setModelMetrics] = useState(null);
  const [dashMetrics, setDashMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getModelMetrics(), getDashboardMetrics()])
      .then(([model, dash]) => { setModelMetrics(model); setDashMetrics(dash); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Mock historical data
  const historyData = [
    { name: 'v1.0', accuracy: 0.85, precision: 0.84, recall: 0.86 },
    { name: 'v1.1', accuracy: 0.88, precision: 0.87, recall: 0.89 },
    { name: 'v1.2', accuracy: 0.89, precision: 0.88, recall: 0.90 },
    { name: 'v1.3', accuracy: 0.91, precision: 0.90, recall: 0.92 },
    { name: 'v1.4', accuracy: 0.92, precision: 0.91, recall: 0.93 },
  ];

  if (loading) return (
    <div className="space-y-6">
      <LoadingSkeleton type="cards" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="chart" />
      </div>
    </div>
  );

  const metricCards = [
    { label: 'Accuracy', value: modelMetrics?.accuracy, color: '#6366f1', icon: Target },
    { label: 'Precision', value: modelMetrics?.precision, color: '#8b5cf6', icon: Crosshair },
    { label: 'Recall', value: modelMetrics?.recall, color: '#10b981', icon: Activity },
    { label: 'F1 Score', value: modelMetrics?.f1_score, color: '#f59e0b', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center gradient-glow">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Model Analytics</h2>
          <p className="text-xs text-slate-400">Model: {modelMetrics?.model_name} · Version {modelMetrics?.version}</p>
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
        {/* Accuracy History */}
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
                <Area type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2} fill="url(#accGrad)" dot={{ fill: '#6366f1', r: 3 }} />
                <Area type="monotone" dataKey="precision" stroke="#8b5cf6" strokeWidth={2} fill="url(#precGrad)" dot={{ fill: '#8b5cf6', r: 3 }} />
                <Area type="monotone" dataKey="recall" stroke="#10b981" strokeWidth={2} fill="url(#recGrad)" dot={{ fill: '#10b981', r: 3 }} />
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

        {/* Category Distribution Accuracy */}
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

      {/* Team Performance */}
      <GlassCard>
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
    </div>
  );
};

export default Analytics;
