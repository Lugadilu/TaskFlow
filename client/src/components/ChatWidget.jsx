import { useState, useRef, useEffect } from 'react';
import { useChat } from "../hooks/useChats";

import { Send, X, MessageCircle } from 'lucide-react';

function ChatWidget() {
  const { 
    messages, 
    connected, 
    isAdmin, 
    username,
    sendMessageToAdmins,
    sendMessageToUser,
    broadcastMessage,
    clearMessages 
  } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim()) {
      return;
    }

    // Send based on user type
    if (isAdmin) {
      if (selectedUserId && selectedUserId !== '') {
        // ✅ Send to SPECIFIC user (not broadcast)
        console.log(`📤 Sending to user ${selectedUserId}`);
        sendMessageToUser(parseInt(selectedUserId), messageInput);
      } else {
        // Only broadcast if user ID is empty/not selected
        console.log('⚠️ Please select a user ID to send a direct message');
        return;
      }
    } else {
      // Regular user sends to admins
      console.log('📤 Sending to admins');
      sendMessageToAdmins(messageInput);
    }

    setMessageInput('');
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all"
        title="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
        {messages.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Window */}
          <div className="fixed bottom-24 right-6 w-96 max-h-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Chat</h3>
                <p className="text-xs text-blue-100">
                  {connected ? '🟢 Connected' : '🔴 Disconnected'}
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Mode - User Selection */}
            {isAdmin && (
            <div className="bg-slate-50 border-b p-3 space-y-2">
                <p className="text-xs text-slate-600 font-medium">
                {selectedUserId ? `Messaging user ${selectedUserId}` : '⚠️ Select a user ID'}
                </p>
                <input
                type="number"
                placeholder="Enter user ID to message"
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                required
                />
                {!selectedUserId && (
                <p className="text-xs text-red-600">User ID is required to send messages</p>
                )}
            </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 text-sm pt-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${
                      msg.sender === 'broadcast'
                        ? 'bg-amber-50 border border-amber-200 rounded-lg p-2'
                        : msg.sender === 'system'
                        ? 'bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-600'
                        : 'flex flex-col'
                    }`}
                  >
                    {msg.isBroadcast && (
                      <p className="text-xs font-semibold text-amber-700 mb-1">
                        📢 Broadcast from {msg.senderName}
                      </p>
                    )}
                    {msg.isSystem ? (
                      <p className="text-xs text-slate-600">{msg.message}</p>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-slate-900">
                          {msg.sender === 'user' ? `👤 ${msg.senderName}` : `👨‍💼 ${msg.senderName}`}
                        </p>
                        <p className="text-sm text-slate-700 break-words">{msg.message}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
              <input
                type="text"
                placeholder={isAdmin ? 'Type message...' : 'Message admins...'}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || !connected}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}

export default ChatWidget;