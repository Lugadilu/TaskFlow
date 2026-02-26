import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../assets/contexts/AuthContext.jsx";
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
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-slate-200 p-6">

        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-6 h-6 text-purple-600" />
          <h2 className="font-bold text-lg">Admin Panel</h2>
        </div>

        {/* Dropdown */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-slate-100"
        >
          <span className="font-medium">Management</span>
          <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="ml-3 mt-2 space-y-2">
            <button
              onClick={() => navigate("/admin/users")}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              <Users className="w-4 h-4" />
              Users
            </button>

            <button
              onClick={() => navigate("/admin/tasks")}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              <ListTodo className="w-4 h-4" />
              Tasks
            </button>
          </div>
        )}

        
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;