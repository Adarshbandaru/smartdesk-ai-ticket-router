import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { Settings as SettingsIcon, Server, Users, Clock, Shield, Database, Cpu, Globe } from 'lucide-react';

const Settings = () => {
  const teams = [
    { name: 'Booking Operations', category: 'Booking', sla: '24 Hours' },
    { name: 'Ticket Operations', category: 'Cancellation', sla: '24 Hours' },
    { name: 'Finance Team', category: 'Refund', sla: '48 Hours' },
    { name: 'Baggage Support', category: 'Baggage', sla: '24 Hours' },
    { name: 'Engineering Support', category: 'Technical Issue', sla: '4 Hours' },
    { name: 'Customer Care', category: 'Customer Service', sla: '24 Hours' },
    { name: 'Escalation Team', category: 'Critical Priority', sla: '1 Hour' },
  ];

  const systemInfo = [
    { icon: Cpu, label: 'ML Pipeline', value: 'TF-IDF + Logistic Regression + XGBoost', desc: 'Ensemble model for category, priority, and root cause prediction' },
    { icon: Database, label: 'Database', value: 'SQLite', desc: 'Lightweight embedded database for demo' },
    { icon: Server, label: 'Backend', value: 'FastAPI + Uvicorn', desc: 'High-performance async Python framework' },
    { icon: Globe, label: 'Frontend', value: 'React + Vite', desc: 'Modern build tooling with hot module replacement' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center gradient-glow">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <p className="text-xs text-slate-400">System configuration and routing rules</p>
        </div>
      </div>

      {/* System Information */}
      <GlassCard>
        <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          System Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemInfo.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-200">{item.label}</span>
                </div>
                <p className="text-sm font-medium text-white mb-1">{item.value}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Routing Rules */}
      <GlassCard className="!p-0 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Team Routing Rules
          </h3>
          <p className="text-xs text-slate-400 mt-1">Tickets are automatically routed based on AI classification</p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/5">
              <th className="px-5 py-3 font-semibold">Team</th>
              <th className="px-5 py-3 font-semibold">Handles Category</th>
              <th className="px-5 py-3 font-semibold">Default SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {teams.map((team, i) => (
              <motion.tr
                key={team.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-3.5 text-sm font-medium text-slate-200">{team.name}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium">
                    {team.category}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {team.sla}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* API Info */}
      <GlassCard>
        <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          API Information
        </h3>
        <div className="space-y-3">
          {[
            { method: 'POST', path: '/api/predict/', desc: 'AI classification & LIME explanation' },
            { method: 'GET', path: '/api/tickets/', desc: 'Fetch paginated tickets with search/filter' },
            { method: 'POST', path: '/api/tickets/', desc: 'Create a new ticket' },
            { method: 'PATCH', path: '/api/tickets/{id}/status', desc: 'Update ticket status' },
            { method: 'GET', path: '/api/analytics/dashboard', desc: 'Dashboard KPIs and charts' },
            { method: 'GET', path: '/api/analytics/metrics', desc: 'ML model performance metrics' },
            { method: 'POST', path: '/api/feedback/', desc: 'Submit prediction feedback' },
          ].map((endpoint, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                endpoint.method === 'GET' ? 'bg-emerald-500/15 text-emerald-400' :
                endpoint.method === 'POST' ? 'bg-blue-500/15 text-blue-400' :
                'bg-amber-500/15 text-amber-400'
              }`}>
                {endpoint.method}
              </span>
              <code className="text-sm text-slate-200 font-mono">{endpoint.path}</code>
              <span className="text-xs text-slate-400 ml-auto">{endpoint.desc}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Settings;
