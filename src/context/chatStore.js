import { create } from 'zustand';
import { chatAPI } from '../utils/api';

const useChatStore = create((set, get) => ({
  conversations: [],
  messages: [],
  activeConversation: null,
  isLoadingConversations: false,
  isLoadingMessages: false,
  unreadCount: 0,

  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (id) => set({ activeConversation: id }),

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const response = await chatAPI.getConversations();
      const convs = response.data.data.conversations || [];
      set({ 
        conversations: convs,
        unreadCount: convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
      });
    } catch (error) {
      console.error('Fetch conversations error:', error);
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  fetchMessages: async (conversationId, page = 1) => {
    set({ isLoadingMessages: true });
    try {
      const response = await chatAPI.getMessages(conversationId, page);
      const newMessages = response.data.data.messages || [];
      
      set((state) => ({ 
        messages: page === 1 ? newMessages : [...newMessages, ...state.messages] 
      }));
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  addMessage: (message) => {
    set((state) => ({ 
      messages: [...state.messages, message] 
    }));
    
    // Update last message in conversation list
    set((state) => ({
      conversations: state.conversations.map(c => 
        c._id === message.conversationId 
          ? { ...c, lastMessage: { content: message.content, sentAt: message.createdAt, sender: message.sender } } 
          : c
      )
    }));
  },

  updateUnreadCount: (conversationId, count) => {
    set((state) => {
      const newConvs = state.conversations.map(c => 
        c._id === conversationId ? { ...c, unreadCount: count } : c
      );
      return {
        conversations: newConvs,
        unreadCount: newConvs.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
      };
    });
  },
  
  setMessagesRead: (conversationId, readBy) => {
    set((state) => ({
      messages: state.messages.map(m => 
        m.conversationId === conversationId && m.sender !== readBy 
          ? { ...m, isRead: true, readAt: new Date() } 
          : m
      ),
      conversations: state.conversations.map(c => 
        c._id === conversationId ? { ...c, unreadCount: 0 } : c
      )
    }));
  }
}));

export default useChatStore;
