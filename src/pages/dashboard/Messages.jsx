import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, Search, ChevronRight, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useChatStore from '../../context/chatStore';
import useSocketStore from '../../context/socketStore';
import ChatWindow from '../../components/chat/ChatWindow';
import { formatDate } from '../../utils/helpers';

const Messages = () => {
  const { conversationId } = useParams();
  const { conversations, fetchConversations, isLoadingConversations, unreadCount } = useChatStore();
  const { onlineUsers } = useSocketStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    fetchConversations();
    // Refresh conversations occasionally to update timestamps/last messages
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants?.find(p => p._id !== currentUser.id);
    return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 overflow-hidden relative">
      {/* Sidebar: Conversations List */}
      <div 
        className={`flex-col w-full lg:w-80 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden transition-all duration-300 ${
          conversationId ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-100 font-display">Messages</h1>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {isLoadingConversations ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-slate-800/20 rounded-xl animate-pulse m-2" />
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="py-10 text-center px-4">
              <MessageSquare className="h-8 w-8 text-slate-700 mx-auto mb-3 opacity-20" />
              <p className="text-xs text-slate-500">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const otherUser = conv.participants?.find(p => p._id !== currentUser.id) || { name: 'User' };
              const isActive = conversationId === conv._id;
              const isUnread = conv.unreadCount > 0;
              const isOnline = onlineUsers.has(otherUser._id);

              return (
                <Link
                  key={conv._id}
                  to={`/dashboard/messages/${conv._id}`}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-indigo-600/10 border-indigo-500/30' 
                      : isUnread 
                        ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60' 
                        : 'bg-transparent border-transparent hover:bg-slate-800/30'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold overflow-hidden shadow-inner">
                      {otherUser.avatar ? (
                        <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="h-5 w-5 opacity-40" />
                      )}
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-lg" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className={`text-sm font-bold truncate ${isUnread || isActive ? 'text-slate-100' : 'text-slate-400'}`}>
                        {otherUser.name}
                      </h3>
                      <span className="text-[9px] text-slate-600 font-medium whitespace-nowrap">
                        {formatDate(conv.lastMessage?.sentAt || conv.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                       <p className={`text-xs truncate ${isUnread ? 'text-indigo-300 font-semibold' : 'text-slate-500'}`}>
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                      {isUnread && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content: Chat Window */}
      <div className={`flex-1 h-full ${!conversationId ? 'hidden lg:block' : 'block'}`}>
        <ChatWindow />
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};

export default Messages;
