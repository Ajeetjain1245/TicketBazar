import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Image as ImageIcon, Paperclip, MoreVertical, ChevronLeft, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSocketStore from '../../context/socketStore';
import useChatStore from '../../context/chatStore';
import { chatAPI } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';
import { maskSensitiveInfo } from '../../utils/privacyFilter';

const ChatWindow = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { user: currentUser } = useAuthStore();
  const { socket, isConnected, joinConversation, leaveConversation, setTyping, typingUsers, onlineUsers, markAsRead } = useSocketStore();
  const { messages, conversations, activeConversation, fetchMessages, addMessage, setActiveConversation } = useChatStore();
  
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const conversation = conversations.find(c => c._id === conversationId);
  const currentUserId = currentUser?._id || currentUser?.id;
  const otherParticipant = conversation?.participants?.find(p => {
    const pId = p._id || p.id;
    return pId && pId !== currentUserId;
  });
  const isOnline = otherParticipant && onlineUsers.has(otherParticipant._id || otherParticipant.id);

  // Load messages and join socket room
  useEffect(() => {
    const initChat = async () => {
      if (conversationId) {
        setIsInitialLoading(true);
        setActiveConversation(conversationId);
        await fetchMessages(conversationId);
        joinConversation(conversationId);
        markAsRead(conversationId);
        setIsInitialLoading(false);
      }
    };
    initChat();
    return () => {
      leaveConversation(conversationId);
    };
  }, [conversationId]);

  // Handle incoming messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (data.conversationId === conversationId) {
        addMessage(data);
        scrollToBottom();
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !fileInputRef.current?.files?.[0]) || isSending) return;

    setIsSending(true);
    try {
      const file = fileInputRef.current?.files?.[0];
      const response = await chatAPI.sendMessage(conversationId, {
        content: inputText,
        attachment: file
      });
      
      const newMessage = response.data.data.message;
      addMessage(newMessage);
      setInputText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900/20 backdrop-blur-sm border border-slate-800 rounded-3xl">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-2" />
        <p className="text-slate-400">Loading conversation...</p>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full bg-slate-900/20 backdrop-blur-sm border border-slate-800 rounded-3xl">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Send className="h-6 w-6 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-300 font-display">Select a conversation</h3>
        <p className="text-slate-500 mt-1">Pick a chat from the sidebar to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard/messages')}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              {otherParticipant?.name || 'Chat Session'}
            </h3>
            <p className={`text-[10px] flex items-center gap-1 ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <button className="p-2 text-slate-500 hover:text-slate-300">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar"
      >
        <AnimatePresence>
          {messages.map((msg, index) => {
            const senderId = msg.sender?._id || msg.sender;
            const isMe = senderId === currentUserId;
            return (
              <motion.div
                key={msg._id || index}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] md:max-w-[70%] space-y-1`}>
                  <div 
                    className={`px-4 py-3 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-lg shadow-indigo-500/10' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                    }`}
                  >
                    {msg.messageType === 'file' && msg.fileUrl && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                        <img src={msg.fileUrl} alt="attachment" className="w-full h-auto max-h-60 object-cover" />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{maskSensitiveInfo(msg.content)}</p>
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span>{formatDate(msg.createdAt)}</span>
                    {isMe && (
                      <span className={msg.isRead ? 'text-indigo-400' : 'text-slate-600'}>
                        {msg.isRead ? 'Seen' : 'Sent'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 px-4 py-2 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-slate-800/30 border-t border-slate-800">
        <div className="flex items-end gap-2 bg-slate-900/50 border border-slate-700 rounded-2xl p-2 focus-within:border-indigo-500/50 transition-all">
          <div className="flex items-center mb-1">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={() => toast.success('Image attached')}
            />
          </div>
          
          <textarea
            value={inputText}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-200 py-2.5 resize-none max-h-32 scroll-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />

          <button
            type="submit"
            disabled={(!inputText.trim() && !fileInputRef.current?.files?.[0]) || isSending}
            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20"
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
