import { useState, useEffect } from 'react';
import { taskApi } from '../services/api';
import { motion } from 'framer-motion';
import { Trash2, Undo2, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrashPage = () => {
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeletedTasks();
  }, []);

  const fetchDeletedTasks = async () => {
    setLoading(true);
    try {
      const data = await taskApi.getDeletedTasks();
      setDeletedTasks(data);
      setError('');
    } catch (err) {
      console.error('Error fetching deleted tasks:', err);
      setError('Failed to load trash');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (taskId) => {
    try {
      await taskApi.restoreTask(taskId);
      setDeletedTasks(deletedTasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error restoring task:', err);
      setError('Failed to restore task');
    }
  };

  const handlePermanentDelete = async (taskId) => {
    if (!window.confirm('Permanently delete this task? This cannot be undone!')) {
      return;
    }

    try {
      await taskApi.permanentDelete(taskId);
      setDeletedTasks(deletedTasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error permanently deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-transparent text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header */}
        <header className="mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Tasks</span>
            </button>

            <div className="flex items-center gap-2 text-blue-600 font-bold tracking-tight mb-1">
              <Trash2 className="w-5 h-5" />
              <span className="uppercase text-[11px] tracking-[0.22em] text-slate-500">Trash</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Deleted Tasks
            </h1>
            <p className="text-slate-500 mt-2">
              Tasks are permanently deleted after 30 days
            </p>
          </motion.div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 mt-4">Loading trash...</p>
          </div>
        ) : deletedTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Trash2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Trash is empty</h3>
            <p className="text-slate-500">Deleted tasks will appear here</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {deletedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-slate-600 mb-3">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>
                        Deleted: {formatDate(task.deletedAt)}
                      </span>
                      {task.deletedBy && (
                        <span>
                          by {task.deletedBy}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full ${
                        task.priority === 'High' ? 'bg-red-100 text-red-700' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestore(task.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <Undo2 className="w-4 h-4" />
                      Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(task.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Forever
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashPage;