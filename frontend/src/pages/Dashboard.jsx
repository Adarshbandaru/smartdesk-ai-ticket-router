import { useState, useEffect } from 'react';
import { getDashboardMetrics, getModelMetrics } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Ticket, AlertCircle, Zap, Clock, Activity, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import AnimatedCounter from '../components/AnimatedCounter';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3 shadow-2xl border border-white/10">
      <p className="text-xs font-semibold text-slate-300 mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-sm font-bold text-white">{item.value}</p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, modelData] = await Promise.all([
          getDashboardMetrics(),
          getModelMetrics()
        ]);
        setMetrics(dashData);
        setModelMetrics(modelData);
      } catch (error) {
        console.error("Failed to fetch dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const kpiCards = [
    { title: 'Total Tickets', value: metrics?.kpi.total_tickets, icon: Ticket, color: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-500/15 text-blue-400' },
    { title: 'Critical', value: metrics?.kpi.critical_tickets, icon: AlertCircle, color: 'from-red-500 to-rose-600', iconBg: 'bg-red-500/15 text-red-400' },
    { title: 'Open', value: metrics?.kpi.open_tickets, icon: Clock, color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-500/15 text-amber-400' },
    { title: 'Resolved', value: metrics?.kpi.resolved_tickets, icon: CheckCircle, color: 'from-emerald-500 to-green-600', iconBg: 'bg-emerald-500/15 text-emerald-400' },
    { title: 'Model Accuracy', value: `${(modelMetrics?.accuracy * 100).toFixed(1)}%`, icon: Activity, color: 'from-indigo-500 to-violet-600', iconBg: 'bg-indigo-500/15 text-indigo-400', isText: true },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="glass-card rounded-2xl p-5 hover-glow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-0.5">
                {card.isText ? card.value : <AnimatedCounter value={card.value} />}
              </h3>
              <p className="text-xs font-medium text-slate-400">{card.title}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <GlassCard>
          <h3 className="text-base font-semibold text-slate-100 mb-5">Tickets by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.charts.category_distribution} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Priority Chart */}
        <GlassCard>
          <h3 className="text-base font-semibold text-slate-100 mb-5">Priority Distribution</h3>
          <div className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.charts.priority_distribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {metrics?.charts.priority_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Team Workload + Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Workload */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">Team Workload</h3>
          </div>
          <div className="space-y-3">
            {metrics?.charts.team_distribution?.map((team, i) => {
              const maxVal = Math.max(...metrics.charts.team_distribution.map(t => t.value));
              const pct = (team.value / maxVal) * 100;
              return (
                <div key={team.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">{team.name}</span>
                    <span className="text-slate-400 tabular-nums">{team.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i+1) % COLORS.length]})` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Recent Tickets */}
        <GlassCard className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-0">
            <h3 className="text-base font-semibold text-slate-100">Recent Tickets</h3>
            <Link to="/inbox" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">View all →</Link>
          </div>
          <div className="mt-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/5">
                  <th className="px-5 py-2.5 font-semibold">ID</th>
                  <th className="px-5 py-2.5 font-semibold">Title</th>
                  <th className="px-5 py-2.5 font-semibold">Priority</th>
                  <th className="px-5 py-2.5 font-semibold">Status</th>
                  <th className="px-5 py-2.5 font-semibold">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {metrics?.recent_tickets?.slice(0, 6).map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-400 font-medium">#{ticket.id}</td>
                    <td className="px-5 py-3 text-sm text-slate-200 font-medium max-w-[200px] truncate">{ticket.title}</td>
                    <td className="px-5 py-3"><StatusBadge type="priority" value={ticket.priority} /></td>
                    <td className="px-5 py-3"><StatusBadge type="status" value={ticket.status} /></td>
                    <td className="px-5 py-3 text-xs text-slate-400">{ticket.assigned_team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
