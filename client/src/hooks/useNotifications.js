import { useEffect, useState, useCallback } from 'react';
import * as SignalR from '@microsoft/signalr';
import { useAuth } from '../assets/contexts/AuthContext';

let notificationCounter = 0; // Global counter for unique IDs

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    // Everyone connects
    if (!token) {
      console.log('❌ Not connecting - no token');
      return;
    }

    console.log('🔄 Attempting to connect to SignalR...');

    const connection = new SignalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/notifications', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
      .withHubProtocol(new SignalR.JsonHubProtocol())
      .build();

    connection.onopen = () => {
      console.log('✅ Connected to SignalR hub');
      setConnected(true);
      setError(null);
    };

    connection.onclose = () => {
      console.log('❌ Disconnected from SignalR hub');
      setConnected(false);
    };

    connection.onerror = (error) => {
      console.error('❌ SignalR error:', error);
      setError(error?.message || 'Connection error');
    };

    // Listen for "TaskCreated" event
    connection.on('TaskCreated', (notification) => {
      console.log('📩 Received TaskCreated notification:', notification);

      // GENERATE UNIQUE ID USING COUNTER
      const uniqueId = `notif_${++notificationCounter}_${Date.now()}`;

      const newNotification = {
        id: uniqueId, // Unique ID
        type: 'task_created',
        taskId: notification.taskId,
        title: notification.title,
        description: notification.description,
        priority: notification.priority,
        createdBy: notification.createdBy, // MAKE SURE THIS EXISTS
        message: notification.message,
        createdAt: notification.createdAt,
        receivedAt: new Date()
      };

      console.log('✅ Creating notification with ID:', uniqueId);
      console.log('✅ Notification details:', newNotification);

      setNotifications(prev => [newNotification, ...prev]);

      // Optional: Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('Task Created', {
          body: notification.message,
          icon: '/taskflow-icon.png',
          tag: 'task-notification'
        });
      }
    });

    // Listen for "TaskUpdated" event
    connection.on('TaskUpdated', (notification) => {
      console.log('📩 Received TaskUpdated notification:', notification);

      const uniqueId = `notif_${++notificationCounter}_${Date.now()}`;

      const newNotification = {
        id: uniqueId,
        type: 'task_updated',
        taskId: notification.taskId,
        title: notification.title,
        description: notification.description,
        priority: notification.priority,
        createdBy: notification.createdBy,
        message: notification.message,
        createdAt: notification.createdAt,
        receivedAt: new Date()
      };

      console.log('✅ Creating notification with ID:', uniqueId);
      setNotifications(prev => [newNotification, ...prev]);
    });

    // Listen for "TaskDeleted" event
    connection.on('TaskDeleted', (notification) => {
      console.log('📩 Received TaskDeleted notification:', notification);

      const uniqueId = `notif_${++notificationCounter}_${Date.now()}`;

      const newNotification = {
        id: uniqueId,
        type: 'task_deleted',
        taskId: notification.taskId,
        title: notification.title,
        description: notification.description,
        priority: notification.priority,
        createdBy: notification.createdBy,
        message: notification.message,
        createdAt: notification.createdAt,
        receivedAt: new Date()
      };

      console.log('✅ Creating notification with ID:', uniqueId);
      setNotifications(prev => [newNotification, ...prev]);
    });

    connection.start()
      .then(() => {
        console.log('✅ SignalR connection established');
      })
      .catch(err => {
        console.error('❌ Failed to connect:', err);
        setError(err.message);
      });

    return () => {
      console.log('🧹 Cleaning up SignalR connection');
      connection.stop();
    };
  }, [token]);

  // REMOVE NOTIFICATION - MAKE SURE THIS IS EXPORTED
  const removeNotification = useCallback((id) => {
    console.log('🗑️ REMOVING notification with ID:', id);
    console.log('📋 Before removal, total notifications:', notifications.length);
    
    setNotifications(prev => {
      const filtered = prev.filter(notif => {
        console.log('Checking notif ID:', notif.id, 'against removal ID:', id, 'Match:', notif.id === id);
        return notif.id !== id;
      });
      
      console.log('📋 After removal, total notifications:', filtered.length);
      return filtered;
    });
  }, [notifications.length]);

  const clearNotifications = useCallback(() => {
    console.log('🗑️ CLEARING all notifications');
    setNotifications([]);
  }, []);

  return {
    notifications,
    connected,
    error,
    clearNotifications,
    removeNotification // MAKE SURE THIS IS EXPORTED
  };
}