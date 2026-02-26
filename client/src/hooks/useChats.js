import { useEffect, useState, useCallback, useRef } from 'react';
import * as SignalR from '@microsoft/signalr';
import { useAuth } from '../assets/contexts/AuthContext';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const { token, user, isAdmin } = useAuth();
  
  // Store connection reference
  const connectionRef = useRef(null);
  // Prevent multiple connection attempts
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    // Only connect if logged in and haven't already connected
    if (!token || hasConnectedRef.current) {
      console.log('❌ No token, cannot connect to chat');
      return;
    }

    // Mark as connected to prevent duplicate connections
    hasConnectedRef.current = true;

    console.log('🔄 Connecting to Chat Hub...');

    // Create SignalR connection to chat hub
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/chat', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
      .build();

    // Store connection in ref
    connectionRef.current = connection;

    // Connection established
    connection.onopen = () => {
      console.log('✅ Connected to Chat Hub');
      setConnected(true);
      setError(null);
    };

    // Connection closed
    connection.onclose = () => {
      console.log('❌ Disconnected from Chat Hub');
      setConnected(false);
    };

    // Connection error
    connection.onerror = (error) => {
      console.error('❌ Chat error:', error);
      setError(error?.message || 'Connection error');
    };

    // ===== RECEIVE MESSAGES =====

    // User receives message from admin
    connection.on('ReceiveMessageFromAdmin', (msg) => {
      console.log('📩 Message from admin:', msg);
      
      const messageObj = {
        id: `msg_${Date.now()}_${Math.random()}`,
        sender: 'admin',
        senderName: msg.adminName,
        message: msg.message,
        timestamp: new Date(msg.timestamp)
      };
      
      setMessages(prev => [...prev, messageObj]);
    });

    // Admin receives message from user
    connection.on('ReceiveMessageFromUser', (msg) => {
      console.log('📩 Message from user:', msg);
      
      const messageObj = {
        id: `msg_${Date.now()}_${Math.random()}`,
        sender: 'user',
        senderName: msg.username,
        senderId: msg.userId,
        message: msg.message,
        timestamp: new Date(msg.timestamp)
      };
      
      setMessages(prev => [...prev, messageObj]);
    });

    // All users receive broadcast from admin
    connection.on('ReceiveBroadcast', (msg) => {
      console.log('📢 Broadcast:', msg);
      
      const messageObj = {
        id: `msg_${Date.now()}_${Math.random()}`,
        sender: 'broadcast',
        senderName: msg.adminName,
        message: msg.message,
        timestamp: new Date(msg.timestamp),
        isBroadcast: true
      };
      
      setMessages(prev => [...prev, messageObj]);
    });

    // Confirmation that message was sent
    connection.on('MessageSent', (data) => {
      console.log('✅ Message sent:', data.message);
    });

    // User disconnected
    connection.on('UserDisconnected', (data) => {
      console.log('❌ User disconnected:', data.username);
      
      const notif = {
        id: `msg_${Date.now()}_${Math.random()}`,
        sender: 'system',
        message: `${data.username} disconnected`,
        timestamp: new Date(data.timestamp),
        isSystem: true
      };
      
      setMessages(prev => [...prev, notif]);
    });

    // Error from server
    connection.on('Error', (error) => {
      console.error('❌ Server error:', error.message);
      setError(error.message);
    });

    // Start connection
    connection.start()
      .then(() => {
        console.log('✅ Chat connection established');
        setConnected(true);
      })
      .catch(err => {
        console.error('❌ Failed to connect:', err);
        setError(err.message);
        hasConnectedRef.current = false; // Reset flag on error
      });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Closing chat connection');
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
      hasConnectedRef.current = false; // Reset flag on cleanup
    };
  }, [token]);

  // ===== SEND MESSAGES =====

  // User sends message to admins
  const sendMessageToAdmins = useCallback((message) => {
    if (!connectionRef.current || !connected) {
      setError('Not connected to chat');
      console.error('❌ Not connected');
      return;
    }

    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    console.log('📤 Sending message to admins:', message);
    
    connectionRef.current.invoke('SendMessageToAdmins', message)
      .catch(err => {
        console.error('❌ Error sending message:', err);
        setError(err.message);
      });
  }, [connected]);

  // Admin sends message to specific user
  const sendMessageToUser = useCallback((userId, message) => {
    if (!connectionRef.current || !connected) {
      setError('Not connected to chat');
      return;
    }

    if (!isAdmin) {
      setError('Only admins can send direct messages');
      return;
    }

    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    console.log(`📤 Sending message to user ${userId}:`, message);
    
    connectionRef.current.invoke('SendMessageToUser', userId, message)
      .catch(err => {
        console.error('❌ Error sending message:', err);
        setError(err.message);
      });
  }, [connected, isAdmin]);

  // Admin broadcasts to all users
  const broadcastMessage = useCallback((message) => {
    if (!connectionRef.current || !connected) {
      setError('Not connected to chat');
      return;
    }

    if (!isAdmin) {
      setError('Only admins can broadcast');
      return;
    }

    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    console.log('📢 Broadcasting:', message);
    
    connectionRef.current.invoke('BroadcastToAllUsers', message)
      .catch(err => {
        console.error('❌ Error broadcasting:', err);
        setError(err.message);
      });
  }, [connected, isAdmin]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    connected,
    error,
    isAdmin,
    username: user?.username,
    sendMessageToAdmins,
    sendMessageToUser,
    broadcastMessage,
    clearMessages
  };
}