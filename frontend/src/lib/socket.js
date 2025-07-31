import { io } from "socket.io-client";
const URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "https://convo-ph9w.onrender.com");
export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
});
