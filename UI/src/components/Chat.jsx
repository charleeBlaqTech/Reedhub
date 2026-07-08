// src/components/Chat.jsx - Private Instant Chat Messaging Console
import React, { useState, useEffect } from 'react';

export default function Chat({ token, currentUser, activeChatPeerId }) {
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [peerProfile, setPeerProfile] = useState(null);
  const [error, setError] = useState('');

  const fetchConversationMatrix = async () => {
    if (!activeChatPeerId) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch data profile for target chat peer
      const peerRes = await fetch(`http://localhost:5000/api/users/${activeChatPeerId}`, { headers });
      if (peerRes.ok) {
        const pData = await peerRes.json();
        setPeerProfile(pData);
      }

      // Fetch message exchange records
      const chatRes = await fetch(`http://localhost:5000/api/chat/${activeChatPeerId}`, { headers });
      if (chatRes.ok) {
        const cData = await chatRes.json();
        setMessages(cData);
      }
    } catch (err) {
      setError('Failed to establish connection link with chat data pipelines.');
    }
  };

  useEffect(() => {
    fetchConversationMatrix();
    // Setup automated mock short polling interface for testing visual updates natively
    const loopInterval = setInterval(fetchConversationMatrix, 4000);
    return () => clearInterval(loopInterval);
  }, [activeChatPeerId, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: activeChatPeerId, message: typedMessage })
      });

      if (response.ok) {
        setTypedMessage('');
        fetchConversationMatrix();
      } else {
        setError('Transmission layer rejected payload bundle.');
      }
    } catch (err) {
      setError('Failed to write downstream packet payload.');
    }
  };

  return (
    <div id="chat-workspace-panel" className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px]" data-testid="chat-console-frame">
      
      {/* CHAT HEADER COMPONENT */}
      <div id="chat-header-bar" className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between" data-testid="chat-header">
        <div>
          <h3 id="chat-title" className="text-sm font-bold text-gray-800" data-testid="text-chat-peer-name">
            Conversation with: {peerProfile ? peerProfile.name : "Loading Peer..."}
          </h3>
          <p className="text-[11px] text-gray-400 font-mono">Peer ID Identifier: {activeChatPeerId}</p>
        </div>
      </div>

      {/* MESSAGES VIEW SCREEN PORTAL */}
      <div id="chat-messages-screen" className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/30" data-testid="div-chat-history-viewport">
        {error && <p className="text-xs text-red-600 text-center p-2 bg-red-50 rounded" data-testid="chat-error-alert">{error}</p>}
        
        {messages.length === 0 ? (
          <p id="chat-empty-prompt" className="text-center text-xs text-gray-400 font-medium py-24" data-testid="text-chat-empty">
            No message packets exchanged yet. Send a transmission string below to break the ice!
          </p>
        ) : (
          messages.map((msg) => {
            const isFromMe = msg.senderId === currentUser?.id;
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[75%] ${isFromMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                data-testid={`msg-block-${msg.id}`}
              >
                <div 
                  className={`p-3 rounded-lg text-xs leading-relaxed font-medium shadow-2xs ${isFromMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}
                  data-testid={`msg-bubble-${msg.id}`}
                >
                  {msg.message}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 font-mono">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
            );
          })
        )}
      </div>

      {/* CHAT SUBMISSION ACTION FOOTER INPUT FORM */}
      <form id="chat-composer-form" onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2" data-testid="form-chat-composer">
        <input
          id="txt-chat-input-message"
          type="text"
          placeholder="Type your verification text packet payload string..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
          data-testid="input-chat-message-field"
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
        />
        <button
          id="btn-chat-send-submit"
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-2xs transition"
          data-testid="btn-chat-send-packet"
        >
          Send Packet
        </button>
      </form>
    </div>
  );
}