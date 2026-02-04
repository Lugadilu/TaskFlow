import { useState } from 'react';
import { taskApi } from '../services/api';

const UpdateTaskForm = ({ tasks, onTaskUpdated }) => {
  const [selectedId, setSelectedId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // When user selects a task, populate the form
  const handleTaskSelect = (e) => {
    const taskId = e.target.value;
    setSelectedId(taskId);
    
    if (!taskId) {
      // Clear form if no task selected
      setTitle('');
      setDescription('');
      setDueDate('');
      setIsCompleted(false);
      return;
    }

    // Find and populate the selected task
    const task = tasks?.find((t) => String(t.id) === String(taskId));
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      // Convert ISO date to YYYY-MM-DD format for input
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setIsCompleted(task.isCompleted || false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedId) {
      setError('Pick a task to update.');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const existing = tasks?.find((t) => String(t.id) === String(selectedId));
    if (!existing) {
      setError('Selected task not found. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dueDateIso =
        dueDate && dueDate.trim()
          ? new Date(`${dueDate}T00:00:00Z`).toISOString()
          : existing.dueDate;

      const payload = {
        id: existing.id,
        title: title.trim(),
        description: description.trim(),
        createdAt: existing.createdAt,
        dueDate: dueDateIso,
        isCompleted: !!isCompleted,
      };

      await taskApi.updateTask(existing.id, payload);

      if (onTaskUpdated) {
        await onTaskUpdated();
      }
      
      // Clear form after successful update
      setSelectedId('');
      setTitle('');
      setDescription('');
      setDueDate('');
      setIsCompleted(false);
    } catch (err) {
      console.error('Error updating task:', err);
      console.log('Update error response:', err.response?.data);
      setError('Failed to update task. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow mb-6 space-y-4"
    >
      <h2 className="text-xl font-bold text-gray-800">Update Task</h2>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Task Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Task to Update
        </label>
        <select
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedId}
          onChange={handleTaskSelect}
        >
          <option value="">-- Choose a task --</option>
          {tasks?.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </div>

      {/* Only show form fields if a task is selected */}
      {selectedId && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCompleted"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isCompleted" className="text-sm font-medium text-gray-700">
              Mark as completed
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Task'}
          </button>
        </>
      )}
    </form>
  );
};

export default UpdateTaskForm;