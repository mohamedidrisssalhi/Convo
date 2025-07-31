import { create } from "zustand";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { socket } from "../lib/socket";
// Notification sound logic
let notificationAudio = null;
let audioUnlocked = false;
if (typeof window !== 'undefined') {
  notificationAudio = new Audio('/notification.wav');
  // Unlock audio on first user interaction (required by browsers)
  const unlock = () => {
    if (!audioUnlocked && notificationAudio) {
      notificationAudio.play().then(() => {
        notificationAudio.pause();
        notificationAudio.currentTime = 0;
        audioUnlocked = true;
        console.log('[NotificationAudio] Audio unlocked');
      }).catch((err) => {
        console.warn('[NotificationAudio] Unlock failed', err);
      });
    }
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('mousemove', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('click', unlock);
  window.addEventListener('keydown', unlock);
  window.addEventListener('mousemove', unlock);
  window.addEventListener('touchstart', unlock);
}



// Expose a method to bind socket events for real-time updates
export function bindChatSocketEvents(socket) {
  if (!socket) return;
  socket.off("newMessage");
  socket.off("sidebarUpdate");
  socket.off("userOnline");
  socket.off("userOffline");
  socket.off("userProfileUpdated");
  // No toast for userOnline/userOffline events (pro UX)
  // (handler intentionally omitted)

  // New message event
  socket.on("newMessage", (newMessage) => {
    const { selectedUser, selectedRoom, messages, friends } = useChatStore.getState();
    let shouldPlaySound = false;
    // Room message logic (unchanged)
    if (newMessage.roomId) {
      if (selectedRoom && newMessage.roomId === selectedRoom._id) {
        useChatStore.setState({ messages: [...messages, newMessage] });
      } else {
        shouldPlaySound = true;
      }
    } else if (newMessage.senderId) {
      // Direct message logic
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        useChatStore.setState({ messages: [...messages, newMessage] });
        // Reset unread count for this friend (already open)
        useChatStore.setState({
          friends: friends.map(f => f._id === newMessage.senderId ? { ...f, unreadCount: 0 } : f)
        });
      } else {
        // Increment unread count for this friend
        useChatStore.setState({
          friends: friends.map(f =>
            f._id === newMessage.senderId
              ? { ...f, unreadCount: (f.unreadCount || 0) + 1 }
              : f
          )
        });
        shouldPlaySound = true;
      }
    }
    if (shouldPlaySound && notificationAudio && audioUnlocked) {
      try {
        notificationAudio.pause(); // Stop any currently playing sound
        notificationAudio.currentTime = 0;
        notificationAudio.volume = 1.0;
        notificationAudio.muted = false;
        notificationAudio.play().catch((err) => {
          console.warn('[NotificationAudio] Play failed', err);
        });
      } catch (e) {
        console.error('[NotificationAudio] Exception', e);
      }
    }
  });

  socket.on("sidebarUpdate", () => {
    if (useChatStore.getState().getUsers) useChatStore.getState().getUsers();
    if (useChatStore.getState().getChatRooms) useChatStore.getState().getChatRooms();
  });

  // Real-time: update friends list instantly when a friend request is accepted
  socket.off("friendsListUpdated");
  socket.on("friendsListUpdated", () => {
    if (useChatStore.getState().getFriends) useChatStore.getState().getFriends();
  });

  // Listen for new incoming friend requests
  socket.off("newFriendRequest");
  socket.on("newFriendRequest", (fromUser) => {
    // Add the new request to Zustand state immediately for real-time UI update
    const prev = useChatStore.getState().incomingRequests || [];
    useChatStore.setState({ incomingRequests: [fromUser, ...prev] });
    // Play notification sound (Steam-style)
    if (notificationAudio && audioUnlocked) {
      notificationAudio.currentTime = 0;
      notificationAudio.play().catch(() => {});
    }
    toast.success(`New friend invite from ${fromUser.fullName} (@${fromUser.username})`);
  });

  socket.on("room-members-updated", (members) => {
    useChatStore.setState({ roomMembers: members });
  });

  socket.on("roomCreated", (room) => {
    const { chatRooms } = useChatStore.getState();
    useChatStore.setState({ chatRooms: [room, ...chatRooms] });
  });
  socket.on("roomUpdated", (room) => {
    const { chatRooms } = useChatStore.getState();
    useChatStore.setState({ chatRooms: chatRooms.map(r => r._id === room._id ? room : r) });
  });
  socket.on("roomDeleted", (roomId) => {
    const { chatRooms } = useChatStore.getState();
    useChatStore.setState({ chatRooms: chatRooms.filter(r => r._id !== roomId) });
  });
}

export const useChatStore = create((set, get) => ({
  // Friends system state
  friends: [],
  incomingRequests: [],
  sentRequests: [],

  // Fetch friends
  getFriends: async () => {
    try {
      const res = await axiosInstance.get("/friends");
      set({ friends: res.data || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch friends");
    }
  },
  // Fetch incoming requests
  getIncomingRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/requests/incoming");
      const prev = get().incomingRequests || [];
      set({ incomingRequests: res.data || [] });
      // Show notification if new incoming requests arrived
      if (res.data && res.data.length > prev.length) {
        const newReqs = res.data.filter(r => !prev.some(p => p._id === r._id));
        newReqs.forEach(r => toast.success(`New friend invite from ${r.fullName} (@${r.username})`));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch incoming requests");
    }
  },
  // Fetch sent requests
  getSentRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/requests/sent");
      const prev = get().sentRequests || [];
      set({ sentRequests: res.data || [] });
      // Show notification if new sent requests appeared
      if (res.data && res.data.length > prev.length) {
        const newReqs = res.data.filter(r => !prev.some(p => p._id === r._id));
        newReqs.forEach(r => toast.success(`Friend request sent to ${r.fullName} (@${r.username})`));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch sent requests");
    }
  },
  // Send a friend request
  sendFriendRequest: async (username) => {
    try {
      await axiosInstance.post("/friends/request", { username });
      toast.success("Friend request sent");
      get().getSentRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send friend request");
    }
  },
  // Accept a friend request
  acceptFriendRequest: async (userId) => {
    try {
      await axiosInstance.post("/friends/accept", { userId });
      toast.success("Friend request accepted");
      get().getFriends();
      get().getIncomingRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept friend request");
    }
  },
  // Reject a friend request
  rejectFriendRequest: async (userId) => {
    try {
      await axiosInstance.post("/friends/reject", { userId });
      toast.success("Friend request rejected");
      get().getIncomingRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject friend request");
    }
  },
  // Cancel a sent friend request
  cancelFriendRequest: async (userId) => {
    try {
      const res = await axiosInstance.post("/friends/cancel", { userId });
      toast.success("Friend request canceled");
      // Use updated lists from backend if present
      if (res.data && (res.data.friends || res.data.sentRequests || res.data.incomingRequests)) {
        if (res.data.friends) set({ friends: res.data.friends });
        if (res.data.sentRequests) set({ sentRequests: res.data.sentRequests });
        if (res.data.incomingRequests) set({ incomingRequests: res.data.incomingRequests });
      } else {
        get().getFriends();
        get().getSentRequests();
        get().getIncomingRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel friend request");
    }
  },
  // Remove a friend
  removeFriend: async (userId) => {
    try {
      await axiosInstance.delete(`/friends/${userId}`);
      toast.success("Friend removed");
      get().getFriends();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove friend");
    }
  },
  messages: [],
  users: [],
  chatRooms: [],
  selectedUser: null,
  selectedRoom: null,
  isUsersLoading: false,
  isRoomsLoading: false,
  isMessagesLoading: false,

  // Real-time room members
  roomMembers: [],

  // User logic
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Chat room logic
  getChatRooms: async () => {
    set({ isRoomsLoading: true });
    try {
      const res = await axiosInstance.get("/chatrooms");
      const myId = useAuthStore.getState().authUser?._id;
      const chatRooms = (res.data || []).map(r => ({
        ...r,
        unreadCount: (r.unreadCounts && myId && r.unreadCounts[myId]) || 0,
      })).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      set({ chatRooms });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch chat rooms");
    } finally {
      set({ isRoomsLoading: false });
    }
  },
  createChatRoom: async ({ name, members, avatar }) => {
    try {
      const res = await axiosInstance.post("/chatrooms", { name, members, avatar });
      set((state) => ({ chatRooms: [...state.chatRooms, res.data] }));
      toast.success("Room created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create room");
    }
  },
  joinChatRoom: async (roomId) => {
    try {
      await axiosInstance.post(`/chatrooms/${roomId}/join`);
      const room = get().chatRooms.find((r) => r._id === roomId);
      set({ selectedRoom: room }); // Do NOT reset roomMembers here
      // Join room via socket
      const sock = useAuthStore.getState().socket || socket;
      sock.emit("join-room", roomId);
      // Listen for member updates
      sock.off("room-members-updated");
      sock.on("room-members-updated", (members) => {
        set({ roomMembers: members });
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join room");
    }
  },
  leaveChatRoom: async (roomId) => {
    try {
      await axiosInstance.post(`/chatrooms/${roomId}/leave`);
      set({ selectedRoom: null, roomMembers: [] });
      const sock = useAuthStore.getState().socket || socket;
      sock.emit("leave-room", roomId);
      sock.off("room-members-updated");
      toast.success("Left room");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave room");
    }
  },
  setSelectedRoom: (room) => {
    set({ selectedRoom: room, selectedUser: null });
    if (room && room._id) {
      // Join room via socket and listen for updates
      const sock = useAuthStore.getState().socket || socket;
      sock.emit("join-room", room._id);
      sock.off("room-members-updated");
      sock.on("room-members-updated", (members) => {
        set({ roomMembers: members });
      });
      // Do NOT reset roomMembers here
    } else {
      // If no room, clear members and listeners
      set({ roomMembers: [] });
      const sock = useAuthStore.getState().socket || socket;
      sock.off("room-members-updated");
    }
  },
  setSelectedUser: (user) => {
    if (!user) {
      set({ selectedUser: null });
      return;
    }
    set((state) => ({
      selectedUser: user,
      selectedRoom: null,
      // Reset unread count for this friend when opening chat
      friends: state.friends.map(f =>
        f._id === user._id ? { ...f, unreadCount: 0 } : f
      )
    }));
  },

  // Message logic (user-to-user, will extend for rooms)
  // Fetch messages for user or room
  getMessages: async (id, type = "user") => {
    set({ isMessagesLoading: true });
    try {
      let res;
      if (type === "user") {
        res = await axiosInstance.get(`/messages/${id}`);
      } else {
        res = await axiosInstance.get(`/messages/room/${id}`);
      }
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  // Send message to user or room
  sendMessage: async (messageData) => {
    const { selectedUser, selectedRoom, messages } = get();
    try {
      let res;
      if (selectedRoom) {
        res = await axiosInstance.post(`/messages/room/${selectedRoom._id}`, messageData);
      } else if (selectedUser) {
        res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      } else {
        throw new Error("No recipient selected");
      }
      // Optimistically add message to UI
      set({ messages: [...messages, res.data] });
      // No need to fetch users/rooms, socket events will update sidebar in real time
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },
  setSentRequests: (sentRequests) => set({ sentRequests }),
  setIncomingRequests: (incomingRequests) => set({ incomingRequests }),
}));
