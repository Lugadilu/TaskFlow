import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../assets/contexts/AuthContext';
import NotificationsModal from './NotificationsModal';



import { Bell } from 'lucide-react';

function AdminNotifications() {
  const { notifications, connected } = useNotifications();
  const { isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show for admins
  if (!isAdmin) {
    return null;
  }

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100"
        aria-label="Open notifications"
        title={connected ? 'Connected to server' : 'Disconnected from server'}
      >
        <Bell className="w-5 h-5" />

        {/* Notification Count Badge */}
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}

        {/* Connection Indicator */}
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${
            connected ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </button>

      {/* Modal - Opens as full page */}
      <NotificationsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

export default AdminNotifications;