// src/pages/admin/Users.jsx
import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../assets/contexts/AuthContext.jsx';
import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  Calendar,
  Shield,
  Trash2,
  Edit,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCog,
  ArrowLeft,
  LogOut,
  Filter
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionInProgress, setActionInProgress] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when search term or role filter changes
  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.id?.toString().includes(term)
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        (user.role || 'user').toLowerCase() === roleFilter.toLowerCase()
      );
    }
    
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId) => {
    try {
      setActionInProgress(userId);
      await adminApi.deleteUser(userId);
      // Remove user from state
      setUsers(users.filter(u => u.id !== userId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(`Failed to delete user: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionInProgress(userId);
      await adminApi.changeUserRole(userId, newRole);
      // Update user in state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      console.error('Error changing role:', err);
      alert(`Failed to change role: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'inactive':
        return 'bg-slate-100 text-slate-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-emerald-100 text-emerald-700';
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
          <p className="text-slate-500">Loading users...</p>
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
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Dashboard</span>
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
              <Users className="w-5 h-5" />
              <span className="uppercase text-[11px] tracking-[0.22em] text-slate-500">User Management</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Manage Users
            </h1>
            <p className="text-slate-500 mt-2">
              View and manage all system users
            </p>
          </motion.div>
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Users"
            value={users.length}
            color="bg-blue-600"
            delay={0}
          />
          <StatCard
            icon={Shield}
            title="Admins"
            value={users.filter(u => u.role === 'admin').length}
            color="bg-purple-600"
            delay={0.1}
          />
          <StatCard
            icon={UserCog}
            title="Moderators"
            value={users.filter(u => u.role === 'moderator').length}
            color="bg-indigo-600"
            delay={0.2}
          />
          <StatCard
            icon={Mail}
            title="Regular Users"
            value={users.filter(u => !u.role || u.role === 'user').length}
            color="bg-emerald-600"
            delay={0.3}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-sm mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by username, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>
            </div>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
        >
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No users found</h3>
              <p className="text-slate-500">
                {searchTerm || roleFilter !== 'all' 
                  ? "Try adjusting your filters" 
                  : "No users have been created yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {userItem.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {userItem.username}
                            </div>
                            <div className="text-xs text-slate-500">
                              ID: {userItem.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-600">
                          <Mail className="w-4 h-4 mr-2 text-slate-400" />
                          {userItem.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {actionInProgress === userItem.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        ) : (
                          <select
                            value={userItem.role || 'user'}
                            onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${getRoleBadgeColor(userItem.role)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(userItem.status || 'active')}`}>
                          {userItem.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {userItem.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
                          {userItem.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                          {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/${userItem.id}/edit`)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {showDeleteConfirm === userItem.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteUser(userItem.id)}
                                disabled={actionInProgress === userItem.id}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowDeleteConfirm(userItem.id)}
                              disabled={actionInProgress === userItem.id}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete user"
                            >
                              {actionInProgress === userItem.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Footer with user count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-sm text-slate-500 text-right"
        >
          Showing {filteredUsers.length} of {users.length} users
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUsers;