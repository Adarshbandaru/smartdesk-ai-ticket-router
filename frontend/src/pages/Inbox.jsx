import { useState, useEffect } from 'react';
import { getTickets } from '../services/api';
import { Search, Filter, AlertTriangle } from 'lucide-react';

const Inbox = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header & Controls */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div className="relative w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold border-b border-slate-200">ID</th>
              <th className="p-4 font-semibold border-b border-slate-200">Title</th>
              <th className="p-4 font-semibold border-b border-slate-200">Category</th>
              <th className="p-4 font-semibold border-b border-slate-200">Priority</th>
              <th className="p-4 font-semibold border-b border-slate-200">Team</th>
              <th className="p-4 font-semibold border-b border-slate-200">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                <td className="p-4 text-sm text-slate-500 font-medium">#{ticket.id}</td>
                <td className="p-4 text-sm text-slate-900 font-medium">{ticket.title}</td>
                <td className="p-4 text-sm text-slate-600">{ticket.category}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold flex w-max items-center ${
                    ticket.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                    ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                    ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {ticket.priority === 'Critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">{ticket.assigned_team}</td>
                <td className="p-4 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {ticket.status}
                  </span>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">No tickets found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inbox;
