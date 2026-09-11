import { useState, useEffect } from 'react';
import { getDashboardMetrics, getModelMetrics } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Ticket, AlertCircle, Clock, CheckCircle, TrendingUp, TrendingDown, Users, Activity, Zap, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/GlassCard';
import AnimatedCounter from '../components/AnimatedCounter';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Link } from 'react-router-dom';

const PRIORITY_COLORS = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#F59E0B',
  Low: '#22C55E',
};

const CATEGORY_COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Fake 7-day trend data for tickets volume
const WEEK_DATA = [
  { day: 'Mon', tickets: 18 },
  { day: 'Tue', tickets: 24 },
  { day: 'Wed', tickets: 21 },
  { day: 'Thu', tickets: 31 },
  { day: 'Fri', tickets: 28 },
  { day: 'Sat', tickets: 14 },
  { day: 'Sun', tickets: 9 },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-glass">
      <p className="label mb-1">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: item.color || item.fill }} />
          <span className="text-[11px] text-zinc-400 capitalize">{item.dataKey}:</span>
          <span className="text-[13px] font-semibold text-zinc-100">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, iconColor, trend, trendUp, isText, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.22 }}
    className="card p-4"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="p-1.5 rounded-[6px]" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} strokeWidth={2} />
      </div>
      {trend && (
        <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </span>
      )}
    </div>
    <div className="metric-value mb-0.5">
      {isText ? value : <AnimatedCounter value={value} />}
    </div>
    <p className="text-[12px] text-zinc-500">{title}</p>
  </motion.div>
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, modelData] = await Promise.all([getDashboardMetrics(), getModelMetrics()]);
        setMetrics(dashData);
        setModelMetrics(modelData);
      } catch (error) {
        console.error('Failed to fetch dashboard metrics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton type="page" rows={6} />;

  const priorityData = metrics?.charts.priority_distribution?.map(item => ({
    ...item,
    fill: PRIORITY_COLORS[item.name] || '#6366F1',
  })) || [];

  const teamData = metrics?.charts.team_distribution || [];
  const maxTeam = teamData.length ? Math.max(...teamData.map(t => t.value)) : 1;

  const accuracy = modelMetrics?.accuracy ? (modelMetrics.accuracy * 100).toFixed(1) + '%' : '—';

  return (
    <div className="p-6 space-y-5">
      {/* Page title row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-zinc-100 tracking-tight">Overview</h2>
          <p className="text-[13px] text-zinc-500 mt-0.5">Real-time ticket analytics and AI routing status</p>
        </div>
        <Link to="/new">
          <button className="btn-primary text-[13px]">
            <span>+ New Ticket</span>
          </button>
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Tickets"
          value={metrics?.kpi.total_tickets}
          icon={Ticket}
          iconColor="#6366F1"
          trend="+12%"
          trendUp={true}
          delay={0}
        />
        <KPICard
          title="Critical Open"
          value={metrics?.kpi.critical_tickets}
          icon={AlertCircle}
          iconColor="#EF4444"
          trend="-3"
          trendUp={false}
          delay={0.05}
        />
        <KPICard
          title="Resolved"
          value={metrics?.kpi.resolved_tickets}
          icon={CheckCircle}
          iconColor="#10B981"
          trend="+8%"
          trendUp={true}
          delay={0.1}
        />
        <KPICard
          title="AI Accuracy"
          value={accuracy}
          icon={Activity}
          iconColor="#6366F1"
          trend="+0.4%"
          trendUp={true}
          isText={true}
          delay={0.15}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ticket volume area chart */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">Ticket Volume</h3>
              <p className="text-[12px] text-zinc-500 mt-0.5">Last 7 days</p>
            </div>
            <span className="badge badge-info">This Week</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEK_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#52525B', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#52525B', fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="url(#ticketGrad)"
                  dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#6366F1', stroke: '#27272A', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority donut */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="section-title">Priority Split</h3>
            <p className="text-[12px] text-zinc-500 mt-0.5">All time</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="42%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="circle"
                  iconSize={7}
                  formatter={(value) => (
                    <span style={{ color: '#71717A', fontSize: '11px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Team workload */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-zinc-500" strokeWidth={1.75} />
            <h3 className="section-title">Team Workload</h3>
          </div>
          <div className="space-y-3">
            {teamData.map((team, i) => {
              const pct = (team.value / maxTeam) * 100;
              const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              return (
                <div key={team.name}>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-zinc-300 font-medium truncate max-w-[140px]">{team.name}</span>
                    <span className="text-zinc-500 tabular-nums ml-2">{team.value}</span>
                  </div>
                  <div className="progress-bar-track">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                      style={{ background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Category distribution bar chart */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Categories</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.charts.category_distribution || []} barSize={22} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#52525B', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#52525B', fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {(metrics?.charts.category_distribution || []).map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent tickets table */}
      <Card animate={false} className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#27272A' }}>
          <h3 className="section-title">Recent Tickets</h3>
          <Link to="/inbox">
            <button className="flex items-center gap-1 text-[12px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
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
            </tr>
          </thead>
          <tbody>
            {metrics?.recent_tickets?.slice(0, 7).map((ticket, i) => (
              <motion.tr
                key={ticket.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.025 }}
              >
                <td>
                  <span className="font-mono text-[12px] text-zinc-500">#{ticket.id}</span>
                </td>
                <td>
                  <span className="text-[13px] text-zinc-200 font-medium" style={{ maxWidth: 220, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ticket.title}
                  </span>
                </td>
                <td>
                  <span className="badge badge-neutral">{ticket.category}</span>
                </td>
                <td><StatusBadge type="priority" value={ticket.priority} /></td>
                <td><StatusBadge type="status" value={ticket.status} /></td>
                <td className="text-zinc-500 text-[12px]">{ticket.assigned_team}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar-track" style={{ width: 48 }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${(ticket.confidence || 0) * 100}%`,
                          background: (ticket.confidence || 0) >= 0.85 ? '#10B981' : (ticket.confidence || 0) >= 0.6 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-zinc-500 tabular-nums">
                      {((ticket.confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default Dashboard;
