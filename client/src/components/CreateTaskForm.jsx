import { useState } from 'react';
import { taskApi } from '../services/api';
import {
  Plus,
  Calendar,
  AlignLeft,
  Type,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const CreateTaskForm = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('A task title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await taskApi.createTask({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null
      });

      setTitle('');
      setDescription('');
      setDueDate('');

      onTaskCreated?.();
    } catch (err) {
      console.error(err);
      setError('Unable to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
      >
        {/* Gradient Accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        {/* Header */}
        <div className="px-6 py-5 border-b bg-slate-50/60 backdrop-blur">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Plus className="w-5 h-5 text-blue-600" />
            New Task
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Capture what needs to be done.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-1">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Type className="w-4 h-4 text-slate-400" />
              Task title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish API integration"
              className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                error && !title
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-400" />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details or context…"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              'Create Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskForm;
