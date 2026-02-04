import { useState, useEffect } from 'react';
import { taskApi } from '../services/api';
import TaskList from '../components/TaskList';
import CreateTaskForm from '../components/CreateTaskForm';
import UpdateTaskForm from '../components/UpdateTaskForm';
import DeleteTask from '../components/DeleteTask';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Sparkles,
  Circle,
} from 'lucide-react';

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [activeForm, setActiveForm] = useState('create'); // create | update | delete

  useEffect(() => {
    fetchTasks();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await taskApi.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'completed') return t.isCompleted;
    if (filter === 'active') return !t.isCompleted;
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-60px)] bg-transparent text-slate-900 selection:bg-blue-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-blue-600 font-bold tracking-tight mb-1">
              <Sparkles className="w-5 h-5" />
              <span className="uppercase text-[11px] tracking-[0.22em] text-slate-500">
                Workspace
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              {greeting},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Productive Human.
              </span>
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2 text-sm">
              <CalendarIcon className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-3"
          >
            <div className="bg-white/80 backdrop-blur border border-slate-200 shadow-soft px-4 py-3 rounded-3xl flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Total tasks
                </p>
                <p className="text-xl font-bold leading-none">{tasks.length}</p>
              </div>
            </div>
          </motion.div>
        </header>

        {/* Task list + actions stacked vertically */}
        <div className="space-y-8">
          {/* Task list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-24 w-full bg-white rounded-2xl border border-slate-100 animate-pulse flex items-center px-6 gap-4"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-slate-100 rounded" />
                      <div className="h-3 w-1/2 bg-slate-50 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {/* Filters are always visible */}
                <div className="flex items-center justify-between px-2 mb-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Active Tasks
                  </h3>
                  <div className="flex gap-2">
                    {['all', 'active', 'completed'].map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFilter(key)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          filter === key
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {key === 'all'
                          ? 'All'
                          : key === 'active'
                          ? 'Active'
                          : 'Completed'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table or inline empty state depending on filter */}
                {tasks.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Circle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No tasks yet</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">
                      Your list is empty. Start by creating a task below.
                    </p>
                  </div>
                ) : (
                  <TaskList tasks={filteredTasks} />
                )}
              </div>
            )}
          </motion.div>

          {/* Actions panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            {/* Segmented buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                {[
                  { key: 'create', label: 'Create', emoji: '➕' },
                  { key: 'update', label: 'Update', emoji: '✏️' },
                  { key: 'delete', label: 'Delete', emoji: '🗑️' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveForm(item.key)}
                    className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                      activeForm === item.key
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <p className="text-xs text-slate-500">
                Choose an action to manage your tasks.
              </p>
            </div>

            {/* Active form */}
            {activeForm === 'create' && <CreateTaskForm onTaskCreated={fetchTasks} />}
            {activeForm === 'update' && (
              <UpdateTaskForm tasks={tasks} onTaskUpdated={fetchTasks} />
            )}
            {activeForm === 'delete' && (
              <DeleteTask tasks={tasks} onTaskDeleted={fetchTasks} />
            )}

            {/* Pro tip */}
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100/70">
              <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" />
                Pro tip
              </h4>
              <p className="text-xs text-indigo-700 leading-relaxed">
                Break large tasks into smaller pieces to stay motivated and keep momentum
                high.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
