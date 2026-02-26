import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../assets/contexts/AuthContext.jsx";
import AdminNotifications from "../components/AdminNotifications";
import {
  Shield,
  Users,
  ListTodo,
  ChevronDown,
  LogOut
} from "lucide-react";

const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-slate-200 p-6 flex flex-col">
        {/* Top Section */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="font-bold text-lg">Admin Panel</h2>
          </div>

          {/* Management Dropdown */}
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="font-medium text-slate-900">Management</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`} 
            />
          </button>

          {/* Management Menu Items */}
          {open && (
            <div className="ml-3 mt-2 space-y-2 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => handleNavigation("/admin/users")}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors ${
                  location.pathname.includes('/admin/users') 
                    ? 'bg-purple-50 text-purple-700 font-medium' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Users
              </button>

              <button
                onClick={() => handleNavigation("/admin/tasks")}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors ${
                  location.pathname.includes('/admin/tasks') 
                    ? 'bg-purple-50 text-purple-700 font-medium' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ListTodo className="w-4 h-4" />
                Tasks
              </button>
            </div>
          )}

          {/* Notifications Section - MOVED HERE, BELOW MANAGEMENT */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="px-3 py-2 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Alerts</span>
              <AdminNotifications />
            </div>
            
            {/* Optional: Show notification count below */}
            <p className="text-xs text-slate-500 mt-2 px-3">Real-time notifications</p>
          </div>
          
        </div>

        {/* Bottom Section - Logout */}
        <div className="mt-auto pt-6 border-t border-slate-200 space-y-3">
          {/* User info */}
          <div className="px-3 py-2 text-xs text-slate-500">
            <p className="text-slate-600">Logged in as</p>
            <p className="font-semibold text-slate-900 truncate">{user?.username}</p>
          </div>

          {/* Logout button */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;