import { X, Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsModal({ isOpen, onClose }) {
  const { notifications, connected, removeNotification, clearNotifications } = useNotifications();

  if (!isOpen) return null;

  const handleClearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      clearNotifications();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen md:min-h-0 md:flex md:items-center md:justify-center">
        <div className="relative bg-white w-full md:max-w-2xl md:rounded-lg md:mx-4 md:my-8 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-800">
                Notifications
              </h2>
              {!connected && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Offline
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No new notifications</p>
                <p className="text-sm text-slate-400 mt-1">
                  Notifications will appear here when tasks are created, updated, or deleted
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="relative p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border-l-4 border-blue-500 group"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      title="Remove notification"
                    >
                      <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
                    </button>

                    {/* Notification type badge */}
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mb-2 ${
                      notification.type === 'task_created' ? 'bg-green-100 text-green-700' :
                      notification.type === 'task_updated' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {notification.type === 'task_created' ? '✨ Task Created' :
                       notification.type === 'task_updated' ? '📝 Task Updated' :
                       '🗑️ Task Deleted'}
                    </span>

                    {/* Notification content */}
                    <p className="text-slate-800 font-medium">{notification.message}</p>
                    
                    {notification.title && (
                      <p className="text-sm text-slate-600 mt-1">
                        Task: {notification.title}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">
                        {new Date(notification.createdAt || notification.receivedAt).toLocaleString()}
                      </span>
                      {notification.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.priority === 'High' ? 'bg-red-100 text-red-700' :
                          notification.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {notification.priority} Priority
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}