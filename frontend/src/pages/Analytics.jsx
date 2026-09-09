import { useState, useEffect } from 'react';
import { getModelMetrics } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const [modelMetrics, setModelMetrics] = useState(null);

  useEffect(() => {
    // In a real app we would fetch historical metrics here
    getModelMetrics().then(data => setModelMetrics(data));
  }, []);

  // Mock historical data for charts
  const historyData = [
    { name: 'v1.0', accuracy: 0.85 },
    { name: 'v1.1', accuracy: 0.88 },
    { name: 'v1.2', accuracy: 0.89 },
    { name: 'v1.3', accuracy: 0.91 },
    { name: 'v1.4', accuracy: 0.92 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">AI Model Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Overall Accuracy</p>
          <h3 className="text-3xl font-bold text-indigo-600 mt-2">{(modelMetrics?.accuracy * 100).toFixed(1)}%</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Precision</p>
          <h3 className="text-3xl font-bold text-indigo-600 mt-2">{(modelMetrics?.precision * 100).toFixed(1)}%</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Recall</p>
          <h3 className="text-3xl font-bold text-indigo-600 mt-2">{(modelMetrics?.recall * 100).toFixed(1)}%</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">F1 Score</p>
          <h3 className="text-3xl font-bold text-indigo-600 mt-2">{(modelMetrics?.f1_score * 100).toFixed(1)}%</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Model Accuracy History</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData}>
            <defs>
              <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Area type="monotone" dataKey="accuracy" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAcc)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
