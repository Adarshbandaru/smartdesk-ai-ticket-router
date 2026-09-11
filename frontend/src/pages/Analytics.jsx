import { useState, useEffect } from 'react';
import { getModelMetrics, getDashboardMetrics, getModelHistory } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import Card from '../components/GlassCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Brain, Target, Activity, TrendingUp, Zap, Clock, GitBranch, ChevronDown, Check } from 'lucide-react';

const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-glass">
      <p className="label mb-1">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ background: item.color || item.fill }} />
          <span className="text-[11px] text-zinc-400 capitalize">{item.dataKey}:</span>
          <span className="text-[12px] font-semibold text-zinc-100">
            {typeof item.value === 'number' && item.value < 2 ? (item.value * 100).toFixed(1) + '%' : item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Fake confidence histogram data
const CONFIDENCE_HIST = [
  { range: '0–10%', count: 1 },
  { range: '10–20%', count: 0 },
  { range: '20–40%', count: 2 },
  { range: '40–60%', count: 3 },
  { range: '60–75%', count: 6 },
  { range: '75–85%', count: 9 },
  { range: '85–95%', count: 14 },
  { range: '95–100%', count: 11 },
];

// Fake confusion matrix (6x6 simplified — categories on axes)
const CATEGORIES = ['Booking', 'Cancel.', 'Refund', 'Baggage', 'Tech', 'CS'];
const CONFUSION = [
  [8, 0, 0, 0, 1, 0],
  [1, 7, 0, 0, 0, 0],
  [0, 0, 6, 0, 0, 1],
  [0, 0, 0, 5, 0, 0],
  [0, 0, 0, 0, 9, 0],
  [1, 0, 0, 0, 0, 7],
];
const maxConf = Math.max(...CONFUSION.flat());

const ConfusionHeatmap = () => (
  <div className="overflow-auto">
    <table style={{ borderCollapse: 'collapse', fontSize: '11px' }}>
      <thead>
        <tr>
          <th className="text-left pb-1 pr-2" style={{ color: '#52525B', fontWeight: 600, fontSize: '10px' }}>
            Actual →
          </th>
          {CATEGORIES.map(c => (
            <th key={c} style={{ color: '#71717A', fontWeight: 500, padding: '0 6px 6px', fontSize: '10px', whiteSpace: 'nowrap' }}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {CONFUSION.map((row, ri) => (
          <tr key={ri}>
            <td style={{ color: '#71717A', paddingRight: '8px', fontSize: '10px', fontWeight: 500, whiteSpace: 'nowrap', paddingBottom: '4px' }}>
              {CATEGORIES[ri]}
            </td>
            {row.map((val, ci) => {
              const intensity = val / maxConf;
              const isCorrect = ri === ci;
              return (
                <td key={ci} style={{ padding: '2px' }}>
                  <div
                    title={`Actual: ${CATEGORIES[ri]}, Predicted: ${CATEGORIES[ci]}, Count: ${val}`}
                    style={{
                      width: 36, height: 28,
                      borderRadius: 3,
                      background: isCorrect
                        ? `rgba(16,185,129,${0.1 + intensity * 0.7})`
                        : val > 0 ? `rgba(239,68,68,${0.08 + intensity * 0.5})` : 'rgba(255,255,255,0.02)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: val > 0 ? 600 : 400,
                      color: isCorrect ? '#34D399' : val > 0 ? '#F87171' : '#27272A',
                      border: '1px solid rgba(255,255,255,0.03)',
                    }}
                  >
                    {val || ''}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const MetricCard = ({ label, value, icon: Icon, color, subtitle, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.2 }}
    className="card p-4"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="p-1.5 rounded-[5px]" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} strokeWidth={2} />
      </div>
    </div>
    <div className="metric-value mb-0.5">{value}</div>
    <p className="text-[12px] text-zinc-500">{label}</p>
    {subtitle && <p className="text-[11px] text-zinc-600 mt-0.5">{subtitle}</p>}
  </motion.div>
);

const Analytics = () => {
  const [modelMetrics, setModelMetrics] = useState(null);
  const [dashMetrics, setDashMetrics] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    Promise.all([getModelMetrics(), getDashboardMetrics(), getModelHistory()])
      .then(([model, dash, history]) => {
        setModelMetrics(model);
        setDashMetrics(dash);
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
        setSelectedVersion(mapped[mapped.length - 1]?.versionLabel || null);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton type="page" rows={6} />;

  const latestVersion = historyData.length ? historyData[historyData.length - 1] : null;
  const categoryData = dashMetrics?.charts.category_distribution || [];
  const teamData = dashMetrics?.charts.team_distribution || [];

  const metricCards = [
    { label: 'Accuracy', value: `${((modelMetrics?.accuracy || 0) * 100).toFixed(1)}%`, icon: Target, color: '#6366F1', subtitle: 'Category + Priority' },
    { label: 'Precision', value: `${((modelMetrics?.precision || 0) * 100).toFixed(1)}%`, icon: Activity, color: '#3B82F6', subtitle: 'Per-class average' },
    { label: 'Recall', value: `${((modelMetrics?.recall || 0) * 100).toFixed(1)}%`, icon: TrendingUp, color: '#10B981', subtitle: 'Macro-averaged' },
    { label: 'F1 Score', value: `${((modelMetrics?.f1_score || 0) * 100).toFixed(1)}%`, icon: Brain, color: '#8B5CF6', subtitle: 'Weighted harmonic' },
    { label: 'Avg Latency', value: `${((dashMetrics?.kpi?.avg_response_time || 0)).toFixed(0)}ms`, icon: Zap, color: '#F59E0B', subtitle: 'End-to-end' },
    { label: 'Model Version', value: latestVersion?.versionLabel || 'v1.4', icon: GitBranch, color: '#10B981', subtitle: 'SmartDesk Ensemble' },
  ];

  // Class-wise precision mock data
  const classwiseData = [
    { category: 'Booking', precision: 0.94, recall: 0.91, f1: 0.92, support: 8 },
    { category: 'Cancellation', precision: 0.88, recall: 0.90, f1: 0.89, support: 7 },
    { category: 'Refund', precision: 0.91, recall: 0.86, f1: 0.88, support: 6 },
    { category: 'Baggage', precision: 1.00, recall: 1.00, f1: 1.00, support: 5 },
    { category: 'Technical Issue', precision: 0.90, recall: 1.00, f1: 0.95, support: 9 },
    { category: 'Customer Service', precision: 0.87, recall: 0.88, f1: 0.87, support: 8 },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-zinc-100 tracking-tight">AI Model Analytics</h2>
          <p className="text-[13px] text-zinc-500 mt-0.5">
            {modelMetrics?.model_name || 'SmartDesk Ensemble'} · {latestVersion?.versionLabel || 'v1.4'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-[6px]" style={{ background: '#1C1C1F', border: '1px solid #27272A', color: '#22C55E' }}>
            <span className="status-online" />
            <span>Model Online</span>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {metricCards.map((m, i) => (
          <MetricCard key={m.label} {...m} delay={i * 0.04} />
        ))}
      </div>

      {/* Charts row 1: version history + category pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">Model Performance History</h3>
              <p className="text-[12px] text-zinc-500 mt-0.5">v1.0 → v1.4 across all metrics</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="f1Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#52525B', fontSize: 11 }} />
                <YAxis
                  domain={[0.8, 1]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#52525B', fontSize: 10 }}
                  tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="accuracy" stroke="#6366F1" strokeWidth={2} fill="url(#accGrad)" dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }} name="accuracy" />
                <Area type="monotone" dataKey="f1_score" stroke="#10B981" strokeWidth={2} fill="url(#f1Grad)" dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} name="f1_score" />
                <Area type="monotone" dataKey="precision" stroke="#F59E0B" strokeWidth={1.5} fill="none" strokeDasharray="4 3" dot={false} name="precision" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3">
            {[{ label: 'Accuracy', color: '#6366F1' }, { label: 'F1 Score', color: '#10B981' }, { label: 'Precision', color: '#F59E0B' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded-full" style={{ background: l.color, display: 'inline-block' }} />
                <span className="text-[11px] text-zinc-500">{l.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="section-title mb-4">Category Distribution</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="42%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={6}
                  formatter={(value) => <span style={{ color: '#71717A', fontSize: '10px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts row 2: confidence histogram + confusion matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="section-title">Confidence Distribution</h3>
            <p className="text-[12px] text-zinc-500 mt-0.5">Histogram of prediction confidence scores</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CONFIDENCE_HIST} barSize={20} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#52525B', fontSize: 9 }} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#52525B', fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {CONFIDENCE_HIST.map((item, i) => (
                    <Cell key={i} fill={i >= 5 ? '#10B981' : i >= 3 ? '#F59E0B' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h3 className="section-title">Confusion Matrix</h3>
            <p className="text-[12px] text-zinc-500 mt-0.5">Predicted vs actual categories</p>
          </div>
          <div className="mt-1">
            <p className="text-[10px] text-zinc-600 mb-2">← Predicted</p>
            <ConfusionHeatmap />
          </div>
        </Card>
      </div>

      {/* Charts row 3: team workload bar + version history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <h3 className="section-title mb-4">Team Ticket Load</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData} barSize={22} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#52525B', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 10 }} width={80} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {teamData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#27272A' }}>
            <GitBranch className="w-4 h-4 text-zinc-500" strokeWidth={1.75} />
            <h3 className="section-title">Version History</h3>
          </div>
          <div>
            {historyData.slice().reverse().map((v, i) => {
              const isLatest = i === 0;
              return (
                <motion.div
                  key={v.version}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-4 py-3 flex items-center gap-3"
                  style={{
                    borderBottom: i < historyData.length - 1 ? '1px solid #1C1C1F' : 'none',
                    background: isLatest ? 'rgba(99,102,241,0.04)' : undefined,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: isLatest ? '#6366F1' : '#3F3F46',
                      boxShadow: isLatest ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-zinc-300">{v.versionLabel}</span>
                      {isLatest && (
                        <span className="badge badge-info text-[9px]">Latest</span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-0.5">
                      Acc {(v.accuracy * 100).toFixed(1)}% · F1 {(v.f1_score * 100).toFixed(1)}%
                    </p>
                  </div>
                  {v.created_at && (
                    <span className="text-[10px] text-zinc-600 shrink-0">
                      {new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Class-wise metrics table */}
      <Card className="overflow-hidden p-0">
        <div className="px-4 py-3 border-b" style={{ borderColor: '#27272A' }}>
          <h3 className="section-title">Class-wise Performance</h3>
          <p className="text-[12px] text-zinc-500 mt-0.5">Per-category precision, recall, and F1 score</p>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1 Score</th>
              <th>Support</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {classwiseData.map((row, i) => (
              <tr key={i}>
                <td className="font-medium text-zinc-200 text-[13px]">{row.category}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar-track" style={{ width: 52 }}>
                      <div className="progress-bar-fill" style={{ width: `${row.precision * 100}%`, background: '#6366F1' }} />
                    </div>
                    <span className="text-[12px] tabular-nums text-zinc-400">{(row.precision * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar-track" style={{ width: 52 }}>
                      <div className="progress-bar-fill" style={{ width: `${row.recall * 100}%`, background: '#10B981' }} />
                    </div>
                    <span className="text-[12px] tabular-nums text-zinc-400">{(row.recall * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td>
                  <span className="text-[13px] font-semibold" style={{ color: row.f1 >= 0.9 ? '#10B981' : row.f1 >= 0.8 ? '#F59E0B' : '#EF4444' }}>
                    {(row.f1 * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="text-zinc-500 tabular-nums text-[12px]">{row.support}</td>
                <td>
                  {row.f1 >= 0.9
                    ? <span className="badge badge-success">Excellent</span>
                    : row.f1 >= 0.8
                    ? <span className="badge badge-medium">Good</span>
                    : <span className="badge badge-critical">Needs work</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default Analytics;
