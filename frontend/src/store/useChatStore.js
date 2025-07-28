
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { socket } from "../lib/socket";

export const useChatStore = create((set, get) => ({
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
      set({ users: res.data });
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
      set({ chatRooms: res.data });
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
  setSelectedUser: (user) => set({ selectedUser: user, selectedRoom: null }),

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
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, selectedRoom } = get();
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      // For user chat
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        set({ messages: [...get().messages, newMessage] });
      }
      // For room chat
      if (selectedRoom && newMessage.roomId === selectedRoom._id) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

}));
