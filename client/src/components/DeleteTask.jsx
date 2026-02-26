import { useState } from 'react';
import { taskApi } from '../services/api';
import { Trash2, AlertTriangle } from 'lucide-react';

const DeleteTask = ({ tasks, onTaskDeleted, onShowUndo }) => {
  const [selectedId, setSelectedId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleTaskSelect = (e) => {
    setSelectedId(e.target.value);
    setError('');
  };

  const handleDelete = async () => {
    if (!selectedId) {
      setError('Select a task first.');
      return;
    }

    setIsDeleting(true);
    try {
      await taskApi.deleteTask(selectedId);
      
      // Notify parent to show undo toast
      if (onShowUndo) {
        onShowUndo(selectedId);
      }
      
      setSelectedId('');
      
      if (onTaskDeleted) {
        await onTaskDeleted();
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete. Try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedTask = tasks?.find((t) => String(t.id) === String(selectedId));

  return (
    <div className="bg-white/80 backdrop-blur border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Trash2 className="w-5 h-5 text-red-600" />
        <h2 className="text-xl font-bold text-slate-900">Delete Task</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Task
        </label>
        <select
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          value={selectedId}
          onChange={handleTaskSelect}
          disabled={isDeleting}
        >
          <option value="">-- Choose task to delete --</option>
          {tasks?.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </div>

      {selectedTask && (
        <div className="border-2 border-red-300 bg-red-50 p-4 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 text-sm">Confirm deletion</p>
              <p className="text-sm text-red-700 mt-1">
                This will move the task to trash. You can restore it within 30 days.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-xl border border-red-200">
            <p className="font-medium text-slate-900">{selectedTask.title}</p>
            {selectedTask.description && (
              <p className="text-sm text-slate-600 mt-1">{selectedTask.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Move to Trash'}
            </button>
            <button
              onClick={() => setSelectedId('')}
              className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteTask;