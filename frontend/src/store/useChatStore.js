import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
  chatRooms: [],
  selectedRoom: null,
  isRoomsLoading: false,
  roomMembers: [], // Real-time members of the selected room

  getChatRooms: async () => {
    set({ isRoomsLoading: true });
    try {
      const res = await axiosInstance.get("/chatrooms");
      set({ chatRooms: res.data });
    } finally {
      set({ isRoomsLoading: false });
    }
  },
  createChatRoom: async ({ name, members, avatar }) => {
    const res = await axiosInstance.post("/chatrooms", { name, members, avatar });
    set((state) => ({ chatRooms: [...state.chatRooms, res.data] }));
  },
  joinChatRoom: async (roomId) => {
    await axiosInstance.post(`/chatrooms/${roomId}/join`);
    set({ selectedRoom: get().chatRooms.find((r) => r._id === roomId) });
    // Listen for real-time room members
    const { socket } = require("../lib/socket");
    socket.emit("join-room", roomId);
    socket.on("room-members-updated", (members) => {
      set({ roomMembers: members });
    });
  },
  leaveChatRoom: async (roomId) => {
    await axiosInstance.post(`/chatrooms/${roomId}/leave`);
    set({ selectedRoom: null, roomMembers: [] });
    const { socket } = require("../lib/socket");
    socket.emit("leave-room", roomId);
    socket.off("room-members-updated");
  },
  setSelectedRoom: (room) => set({ selectedRoom: room }),
}));
