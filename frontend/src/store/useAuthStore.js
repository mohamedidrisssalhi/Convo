
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Notification sound for online/offline and message events
const notificationAudio = typeof window !== 'undefined' ? new Audio('/notification.mp3') : null;

// Only one BASE_URL and useAuthStore definition should exist

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "/");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  lastOnlineUsers: [], // For detecting online/offline changes
  presence: "online", // User presence: online, away, busy, offline
  socket: null,

  checkAuth: async () => {
    try {
      // Always rely on httpOnly cookie for JWT
      const res = await axiosInstance.get("/auth/check", { withCredentials: true });
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },


  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    try {
      await axiosInstance.post("/auth/change-password", { oldPassword, newPassword });
      toast.success("Password changed successfully");
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to change password");
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket });
  },

  // Call this in a React effect (e.g. in App.jsx) to guarantee listeners are always attached
  bindSocketEvents: () => {
    const { socket } = get();
    if (!socket) return;
    // Remove previous listeners to avoid duplicates
    socket.off("getOnlineUsers");
    socket.off("userProfileUpdated");
    socket.off("presenceUpdate");

    socket.on("getOnlineUsers", (userIds) => {
      // Only update state, no toasts or notification sounds for online/offline events
      set({ onlineUsers: userIds, lastOnlineUsers: userIds });
    });

    socket.on("userProfileUpdated", (updatedUser) => {
      if (get().authUser?._id === updatedUser._id) {
        set({ authUser: { ...get().authUser, ...updatedUser } });
      }
    });

    socket.on("presenceUpdate", ({ userId, presence }) => {
      if (get().authUser?._id === userId) {
        set({ presence });
      }
    });
  },
  // Set presence state (online, away, busy, offline)
  setPresence: (presence) => {
    set({ presence });
    const { socket, authUser } = get();
    if (socket && authUser) {
      socket.emit("setPresence", { userId: authUser._id, presence });
    }
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
