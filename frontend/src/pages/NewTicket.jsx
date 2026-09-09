import { useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { predictTicket, createTicket } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Clock, Users, Zap, Search } from 'lucide-react';

const NewTicket = () => {
  const { register, handleSubmit, formState: { errors } } = useHookForm();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [ticketSaved, setTicketSaved] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setPrediction(null);
    setTicketSaved(false);
    try {
      const result = await predictTicket(data.title, data.description);
      setPrediction({ ...result, originalData: data });
    } catch (error) {
      console.error("Prediction failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await createTicket({
        title: prediction.originalData.title,
        description: prediction.originalData.description,
        category: prediction.category,
        priority: prediction.priority,
        root_cause: prediction.root_cause,
        assigned_team: prediction.assigned_team,
        confidence: prediction.category_confidence,
        processing_time: prediction.processing_time_ms
      });
      setTicketSaved(true);
      setTimeout(() => {
        setPrediction(null);
        setTicketSaved(false);
        // Reset form would go here, maybe handled by passing reset from useHookForm
      }, 3000);
    } catch (error) {
      console.error("Failed to save ticket", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Submission Form */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Submit New Ticket</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Ticket Title</label>
            <input
              {...register("title", { required: true })}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. Cannot complete my booking for NYC"
            />
            {errors.title && <span className="text-red-500 text-sm mt-1">Title is required</span>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              {...register("description", { required: true })}
              rows="6"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Please describe the issue in detail..."
            ></textarea>
            {errors.description && <span className="text-red-500 text-sm mt-1">Description is required</span>}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Analyzing via AI...
              </span>
            ) : "Analyze & Route Ticket"}
          </button>
        </form>
      </div>

      {/* AI Prediction Results */}
      <div className="relative">
        <AnimatePresence>
          {prediction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-xl border border-indigo-100 shadow-xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <Zap className="w-5 h-5 text-indigo-500 mr-2" />
                    AI Triage Results
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Processed in {prediction.processing_time_ms}ms</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${
                  prediction.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                  prediction.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                  prediction.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {prediction.priority}
                </div>
              </div>

              <div className="space-y-6">
                {/* Category & Root Cause */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</p>
                    <p className="font-semibold text-slate-800">{prediction.category}</p>
                    <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${prediction.category_confidence * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Root Cause</p>
                    <p className="font-semibold text-slate-800">{prediction.root_cause}</p>
                    <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${prediction.root_cause_confidence * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Routing & SLA */}
                <div className="p-5 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Assigned Team</p>
                    <p className="font-bold text-indigo-700 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {prediction.assigned_team}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Suggested SLA</p>
                    <p className="font-bold text-indigo-700 flex items-center justify-end">
                      <Clock className="w-4 h-4 mr-2" />
                      {prediction.suggested_sla}
                    </p>
                  </div>
                </div>

                {/* LIME Explanation */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center mb-3">
                    <Search className="w-4 h-4 mr-2 text-slate-500" />
                    Explainable AI (LIME)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {prediction.lime_explanation?.highlighted_text.map(([word, score], idx) => {
                      const isPositive = score > 0;
                      return (
                        <span 
                          key={idx} 
                          className={`px-2 py-1 rounded text-xs font-medium border ${
                            isPositive 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {word} ({isPositive ? '+' : ''}{score.toFixed(2)})
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={handleApprove}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center"
                  >
                    {ticketSaved ? (
                      <><CheckCircle className="w-5 h-5 mr-2" /> Saved!</>
                    ) : (
                      "Approve & Create Ticket"
                    )}
                  </button>
                  <button className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                    Reject / Edit
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!prediction && !loading && (
          <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 p-8 text-center min-h-[500px]">
            <Zap className="w-12 h-12 mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Awaiting Ticket Input</h3>
            <p className="text-sm max-w-xs">Fill out the form on the left and our AI will automatically classify, prioritize, and route the ticket in milliseconds.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewTicket;
