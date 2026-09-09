import { useState, useEffect } from 'react';
import { getDashboardMetrics, getModelMetrics } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Ticket, AlertCircle, Zap, Clock, Activity } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard title="Total Tickets" value={metrics?.kpi.total_tickets} icon={Ticket} color="bg-blue-50 text-blue-600" />
        <MetricCard title="Critical Tickets" value={metrics?.kpi.critical_tickets} icon={AlertCircle} color="bg-red-50 text-red-600" />
        <MetricCard title="Auto Routed" value={`${metrics?.kpi.auto_routed}`} icon={Zap} color="bg-green-50 text-green-600" />
        <MetricCard title="Avg Response (ms)" value={metrics?.kpi.avg_response_time} icon={Clock} color="bg-amber-50 text-amber-600" />
        <MetricCard title="Model Accuracy" value={`${(modelMetrics?.accuracy * 100).toFixed(1)}%`} icon={Activity} color="bg-indigo-50 text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Tickets by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.charts.category_distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Priority Distribution</h3>
          <div className="h-80 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.charts.priority_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics?.charts.priority_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

export default Dashboard;
