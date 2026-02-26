import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../assets/contexts/AuthContext.jsx';
import { motion } from 'framer-motion';
import {
  Users,
  ListTodo,
  CheckCircle,
  Trash2,
  UserPlus,
  LayoutDashboard,
  ArrowLeft,
  Shield,
  LogOut
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getStatistics();
      setStats(data);
      setError('');
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-transparent text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header */}
        <header className="mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to My Tasks</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            <div className="flex items-center gap-2 text-blue-600 font-bold tracking-tight mb-1">
              <Shield className="w-5 h-5" />
              <span className="uppercase text-[11px] tracking-[0.22em] text-slate-500">Admin Panel</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              System Dashboard
            </h1>
            <p className="text-slate-500 mt-2">
              Welcome, <span className="font-semibold">{user?.username}</span> 
            </p>
          </motion.div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Users}
                title="Total Users"
                value={stats.totalUsers}
                color="bg-blue-600"
                delay={0}
              />
              <StatCard
                icon={ListTodo}
                title="Total Tasks"
                value={stats.totalTasks}
                color="bg-indigo-600"
                delay={0.1}
              />
              <StatCard
                icon={CheckCircle}
                title="Completed Tasks"
                value={stats.completedTasks}
                color="bg-green-600"
                delay={0.2}
              />
              <StatCard
                icon={Trash2}
                title="Deleted Tasks"
                value={stats.deletedTasks}
                color="bg-red-600"
                delay={0.3}
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={Shield}
                title="Admin Users"
                value={stats.totalAdmins}
                color="bg-purple-600"
                delay={0.4}
              />
              <StatCard
                icon={LayoutDashboard}
                title="Active Tasks"
                value={stats.activeTasks}
                color="bg-orange-600"
                delay={0.5}
              />
              <StatCard
                icon={UserPlus}
                title="Assigned Tasks"
                value={stats.assignedTasks}
                color="bg-teal-600"
                delay={0.6}
              />
            </div>

            {/* Tasks Per User */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Average Tasks Per User
              </h3>
              <p className="text-4xl font-bold text-blue-600">
                {stats.tasksPerUser.toFixed(1)}
              </p>
            </motion.div>
          </>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-left"
            >
              <Users className="w-5 h-5" />
              <div>
                <p className="font-semibold">Manage Users</p>
                <p className="text-sm text-blue-100">View and manage all users</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/tasks')}
              className="flex items-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors text-left"
            >
              <ListTodo className="w-5 h-5" />
              <div>
                <p className="font-semibold">Manage Tasks</p>
                <p className="text-sm text-indigo-100">View and assign all tasks</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;