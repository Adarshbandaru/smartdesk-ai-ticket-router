import { useState, useEffect } from 'react';
import { getFeedbackQueue } from '../services/api';
import { RefreshCw } from 'lucide-react';

const FeedbackQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const data = await getFeedbackQueue();
      setQueue(data);
    } catch (error) {
      console.error("Failed to fetch feedback queue", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Feedback Queue</h2>
          <p className="text-sm text-slate-500 mt-1">Review incorrect predictions to retrain models.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retrain Models
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold border-b border-slate-200">Ticket ID</th>
              <th className="p-4 font-semibold border-b border-slate-200">Predicted Cat.</th>
              <th className="p-4 font-semibold border-b border-slate-200">Actual Cat.</th>
              <th className="p-4 font-semibold border-b border-slate-200">Comments</th>
              <th className="p-4 font-semibold border-b border-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {queue.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-4 text-sm font-medium text-slate-900">#{item.ticket_id}</td>
                <td className="p-4 text-sm text-red-500">{item.predicted_category}</td>
                <td className="p-4 text-sm text-green-600 font-semibold">{item.actual_category}</td>
                <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{item.comments}</td>
                <td className="p-4 text-sm">
                  <button className="text-indigo-600 hover:text-indigo-800 font-medium">Approve</button>
                </td>
              </tr>
            ))}
            {queue.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">Queue is empty. Models are performing perfectly!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackQueue;
