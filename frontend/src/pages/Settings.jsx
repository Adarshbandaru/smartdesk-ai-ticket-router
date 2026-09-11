import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/GlassCard';
import {
  Settings as SettingsIcon, Server, Users, Clock, Shield, Database,
  Cpu, Globe, CheckCircle, Activity, RefreshCw, ChevronDown, ChevronRight,
  Zap, Bot, ToggleLeft, ToggleRight, AlertCircle
} from 'lucide-react';

const Toggle = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #1C1C1F' }}>
    <div className="flex-1 pr-4">
      <p className="text-[13px] font-medium text-zinc-200">{label}</p>
      {description && <p className="text-[12px] text-zinc-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className="flex items-center gap-1.5 text-[12px] font-medium transition-colors"
      style={{ color: enabled ? '#6366F1' : '#52525B' }}
    >
      {enabled
        ? <ToggleRight className="w-5 h-5" style={{ color: '#6366F1' }} />
        : <ToggleLeft className="w-5 h-5" style={{ color: '#3F3F46' }} />
      }
      <span>{enabled ? 'On' : 'Off'}</span>
    </button>
  </div>
);

const SliderSetting = ({ label, value, onChange, min = 0, max = 100, unit = '%', description }) => (
  <div className="py-3" style={{ borderBottom: '1px solid #1C1C1F' }}>
    <div className="flex items-center justify-between mb-2">
      <div>
        <p className="text-[13px] font-medium text-zinc-200">{label}</p>
        {description && <p className="text-[12px] text-zinc-500 mt-0.5">{description}</p>}
      </div>
      <span className="text-[13px] font-semibold text-zinc-100 tabular-nums">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full"
      style={{
        accentColor: '#6366F1',
        cursor: 'pointer',
        height: '4px',
      }}
    />
    <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
      <span>{min}{unit}</span>
      <span>{max}{unit}</span>
    </div>
  </div>
);

const StatusIndicator = ({ label, status = 'online', value }) => {
  const colors = { online: '#22C55E', offline: '#EF4444', warning: '#F59E0B' };
  const color = colors[status] || '#22C55E';
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #1C1C1F' }}>
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: color, boxShadow: status === 'online' ? `0 0 0 3px ${color}20` : 'none' }}
        />
        <span className="text-[13px] text-zinc-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[12px] text-zinc-500">{value}</span>}
        <span
          className="badge text-[10px]"
          style={{
            background: `${color}12`, color, borderColor: `${color}25`
          }}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  );
};

const routingRules = [
  { category: 'Booking', team: 'Booking Operations', sla: '24h', escalation: false },
  { category: 'Cancellation', team: 'Ticket Operations', sla: '24h', escalation: false },
  { category: 'Refund', team: 'Finance Team', sla: '48h', escalation: false },
  { category: 'Baggage', team: 'Baggage Support', sla: '24h', escalation: false },
  { category: 'Technical Issue', team: 'Engineering Support', sla: '4h', escalation: true },
  { category: 'Customer Service', team: 'Customer Care', sla: '24h', escalation: false },
  { category: 'Critical Priority', team: 'Escalation Team', sla: '1h', escalation: true },
];

const apiEndpoints = [
  { method: 'POST', path: '/api/predict/', desc: 'AI classification & LIME explanation' },
  { method: 'GET', path: '/api/tickets/', desc: 'Fetch paginated tickets with search/filter' },
  { method: 'POST', path: '/api/tickets/', desc: 'Create a new ticket' },
  { method: 'PATCH', path: '/api/tickets/{id}/status', desc: 'Update ticket status' },
  { method: 'GET', path: '/api/analytics/dashboard', desc: 'Dashboard KPIs and charts' },
  { method: 'GET', path: '/api/analytics/metrics', desc: 'ML model performance metrics' },
  { method: 'GET', path: '/api/analytics/metrics/history', desc: 'Model version history' },
  { method: 'POST', path: '/api/feedback/', desc: 'Submit prediction feedback' },
  { method: 'GET', path: '/api/feedback/', desc: 'Get feedback queue' },
];

const methodColor = {
  GET: { bg: 'rgba(16,185,129,0.1)', color: '#34D399', border: 'rgba(16,185,129,0.2)' },
  POST: { bg: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: 'rgba(59,130,246,0.2)' },
  PATCH: { bg: 'rgba(245,158,11,0.1)', color: '#FCD34D', border: 'rgba(245,158,11,0.2)' },
  DELETE: { bg: 'rgba(239,68,68,0.1)', color: '#F87171', border: 'rgba(239,68,68,0.2)' },
};

const Settings = () => {
  const [autoRouting, setAutoRouting] = useState(true);
  const [limeEnabled, setLimeEnabled] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [maxQueueSize, setMaxQueueSize] = useState(100);

  const lastRetrained = '2026-09-11, 05:07 UTC';

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-bold text-zinc-100 tracking-tight">Settings</h2>
        <p className="text-[13px] text-zinc-500 mt-0.5">AI model configuration and system routing rules</p>
      </div>

      {/* AI Model Settings */}
      <Card className="overflow-hidden p-0">
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#27272A' }}>
          <div className="w-5 h-5 rounded-[4px] flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <Bot className="w-3 h-3 text-indigo-400" />
          </div>
          <h3 className="section-title">AI Model Settings</h3>
        </div>
        <div className="px-4">
          {/* Active model version */}
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #1C1C1F' }}>
            <div>
              <p className="text-[13px] font-medium text-zinc-200">Active Model Version</p>
              <p className="text-[12px] text-zinc-500 mt-0.5">SmartDesk Ensemble — TF-IDF + XGBoost</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-success text-[10px]">v1.4 Current</span>
            </div>
          </div>

          <SliderSetting
            label="Confidence Threshold"
            value={confidenceThreshold}
            onChange={setConfidenceThreshold}
            min={50}
            max={99}
            unit="%"
            description="Tickets below this confidence will be flagged for human review"
          />

          <Toggle
            enabled={autoRouting}
            onChange={setAutoRouting}
            label="Auto Routing"
            description="Automatically route tickets to teams based on AI classification"
          />

          <Toggle
            enabled={limeEnabled}
            onChange={setLimeEnabled}
            label="LIME Explanations"
            description="Generate explainable AI word-level impact analysis for each prediction"
          />
        </div>
      </Card>

      {/* Routing rules */}
      <Card className="overflow-hidden p-0">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#27272A' }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[4px] flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Users className="w-3 h-3 text-amber-400" />
            </div>
            <h3 className="section-title">Team Routing Rules</h3>
          </div>
          <span className="text-[12px] text-zinc-500">Auto-assign by AI classification</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Assigned Team</th>
              <th>Default SLA</th>
              <th>Escalation</th>
            </tr>
          </thead>
          <tbody>
            {routingRules.map((rule, i) => (
              <motion.tr
                key={rule.category}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <td>
                  <span className="badge badge-neutral text-[11px]">{rule.category}</span>
                </td>
                <td className="text-zinc-200 text-[13px] font-medium">{rule.team}</td>
                <td>
                  <div className="flex items-center gap-1.5 text-[12px] text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-600" strokeWidth={1.75} />
                    {rule.sla}
                  </div>
                </td>
                <td>
                  {rule.escalation
                    ? <span className="badge badge-critical text-[10px]">Auto-escalate</span>
                    : <span className="text-zinc-600 text-[11px]">—</span>
                  }
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* System health */}
      <Card className="overflow-hidden p-0">
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#27272A' }}>
          <div className="w-5 h-5 rounded-[4px] flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Activity className="w-3 h-3 text-emerald-400" />
          </div>
          <h3 className="section-title">System Health</h3>
        </div>
        <div className="px-4 py-1">
          <StatusIndicator label="FastAPI Backend" status="online" value="localhost:8000" />
          <StatusIndicator label="AI Model Server" status="online" value="SmartDesk Ensemble v1.4" />
          <StatusIndicator label="SQLite Database" status="online" value="39 tickets indexed" />
          <StatusIndicator label="LIME Engine" status="online" value={limeEnabled ? 'Enabled' : 'Disabled'} />
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-zinc-600" strokeWidth={1.75} />
              <span className="text-[13px] text-zinc-300">Last Retrained</span>
            </div>
            <span className="text-[12px] text-zinc-500">{lastRetrained}</span>
          </div>
        </div>
      </Card>

      {/* Stack info */}
      <Card className="overflow-hidden p-0">
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#27272A' }}>
          <div className="w-5 h-5 rounded-[4px] flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Server className="w-3 h-3 text-blue-400" />
          </div>
          <h3 className="section-title">System Architecture</h3>
        </div>
        <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: Cpu, label: 'ML Pipeline', value: 'TF-IDF + Logistic Regression + XGBoost', color: '#6366F1' },
            { icon: Database, label: 'Database', value: 'SQLite · Embedded · Development mode', color: '#3B82F6' },
            { icon: Server, label: 'Backend', value: 'FastAPI + Uvicorn · Python 3.11+', color: '#10B981' },
            { icon: Globe, label: 'Frontend', value: 'React 19 + Vite 8 + TailwindCSS v4', color: '#F59E0B' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 p-3 rounded-[6px]"
                style={{ background: '#111111', border: '1px solid #1C1C1F' }}
              >
                <div className="p-1.5 rounded-[4px] shrink-0" style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: item.color }} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 font-medium">{item.label}</p>
                  <p className="text-[12px] text-zinc-300 mt-0.5">{item.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* API Reference */}
      <Card className="overflow-hidden p-0">
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#27272A' }}>
          <div className="w-5 h-5 rounded-[4px] flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Shield className="w-3 h-3 text-violet-400" />
          </div>
          <h3 className="section-title">API Reference</h3>
        </div>
        <div className="divide-y" style={{ divideColor: '#1C1C1F' }}>
          {apiEndpoints.map((ep, i) => {
            const cfg = methodColor[ep.method] || methodColor.GET;
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < apiEndpoints.length - 1 ? '1px solid #1C1C1F' : 'none' }}>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] shrink-0"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: 'monospace' }}
                >
                  {ep.method}
                </span>
                <code className="text-[12px] text-zinc-300 font-mono flex-1" style={{ fontFamily: '"SFMono-Regular", monospace' }}>
                  {ep.path}
                </code>
                <span className="text-[11px] text-zinc-500 hidden sm:block">{ep.desc}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Settings;
