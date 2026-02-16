import { useAuth } from '../assets/contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { taskApi } from '../services/api';
import TaskList from '../components/TaskList';
import CreateTaskForm from '../components/CreateTaskForm';
import UpdateTaskForm from '../components/UpdateTaskForm';
import DeleteTask from '../components/DeleteTask';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Sparkles,
  Circle,
  LogOut,
  Search,
  Undo2, // New Undo/Close Icon
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [sortBy, setSortBy] = useState('newest');
  
  // Changed default to null so no form is open initially unless you want 'create'
  const [activeForm, setActiveForm] = useState(null); 

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    const isCompleted = filter === 'all' ? null : filter === 'completed';
    const delayDebounceFn = setTimeout(() => {
      fetchTasks({ search, isCompleted, sortBy });
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filter, sortBy]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchTasks = async (params = {}) => {
    setLoading(true);
    try {
      const data = await taskApi.getAllTasks(params);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-transparent text-slate-900 selection:bg-blue-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header (Keep as is) */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-blue-600 font-bold tracking-tight mb-1">
              <Sparkles className="w-5 h-5" />
              <span className="uppercase text-[11px] tracking-[0.22em] text-slate-500">Workspace</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Productive Human.</span>
            </h1>
          </motion.div>

          <div className="flex gap-3">
             <div className="bg-white/80 backdrop-blur border border-slate-200 shadow-soft px-4 py-3 rounded-3xl flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-blue-600" />
              <p className="text-xl font-bold">{tasks.length}</p>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-100">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>

        {/* Search Bar (Keep as is) */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
            </div>
            <div className="flex gap-2">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-slate-200 rounded-2xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="title">Title A-Z</option>
                </select>
            </div>
        </div>

        <div className="space-y-8">
          <TaskList tasks={tasks} />

          {/* Actions panel */}
          <motion.div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                {[
                  { key: 'create', label: 'Create', icon: <Plus className="w-3 h-3"/> },
                  { key: 'update', label: 'Update', icon: <Pencil className="w-3 h-3"/> },
                  { key: 'delete', label: 'Delete', icon: <Trash2 className="w-3 h-3"/> },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveForm(item.key)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                      activeForm === item.key
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}

                {/* --- NEW UNDO / CLOSE BUTTON --- */}
                {activeForm && (
                  <button
                    onClick={() => setActiveForm(null)}
                    className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors ml-1 border-l border-slate-100"
                    title="Close form"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {activeForm ? `Currently in ${activeForm} mode` : 'Select an action'}
              </p>
            </div>

            {/* Form Section with Animation */}
            <AnimatePresence mode="wait">
                {activeForm === 'create' && (
                    <motion.div key="create" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <CreateTaskForm onTaskCreated={() => fetchTasks({ search, sortBy })} />
                    </motion.div>
                )}
                {activeForm === 'update' && (
                    <motion.div key="update" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <UpdateTaskForm tasks={tasks} onTaskUpdated={() => fetchTasks({ search, sortBy })} />
                    </motion.div>
                )}
                {activeForm === 'delete' && (
                    <motion.div key="delete" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <DeleteTask tasks={tasks} onTaskDeleted={() => fetchTasks({ search, sortBy })} />
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;