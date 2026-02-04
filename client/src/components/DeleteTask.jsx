import { useState } from 'react';
import { taskApi } from '../services/api';
import { Trash2, AlertTriangle } from 'lucide-react';

const DeleteTask = ({ tasks, onTaskDeleted }) => {
  const [selectedId, setSelectedId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleTaskSelect = (e) => {
    setSelectedId(e.target.value);
    setShowConfirm(false);
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
      
      setSelectedId('');
      setShowConfirm(false);
      
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
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <div className="flex items-center gap-2">
        <Trash2 className="w-5 h-5 text-red-600" />
        <h2 className="text-xl font-bold text-gray-800">Delete Task</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Task
        </label>
        <select
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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

      {selectedId && !showConfirm && (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
        >
          Delete
        </button>
      )}

      {showConfirm && selectedTask && (
        <div className="border-2 border-red-300 bg-red-50 p-4 rounded space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 text-sm">Confirm deletion</p>
              <p className="text-sm text-red-700 mt-1">This cannot be undone.</p>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border border-red-200">
            <p className="font-medium text-gray-900">{selectedTask.title}</p>
            {selectedTask.description && (
              <p className="text-sm text-gray-600 mt-1">{selectedTask.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-60"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
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