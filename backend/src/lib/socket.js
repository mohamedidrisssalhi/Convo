import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}


// used to store online users
const userSocketMap = {}; // {userId: socketId}
// used to store room membership: {roomId: Set(socketId)}
const roomSocketMap = {};


io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Join a room for real-time updates
  socket.on("join-room", async (roomId) => {
    if (!roomSocketMap[roomId]) roomSocketMap[roomId] = new Set();
    roomSocketMap[roomId].add(socket.id);
    socket.join(roomId);
    // Fetch members from DB and emit
    const { default: ChatRoom } = await import("../models/chatRoom.model.js");
    const room = await ChatRoom.findById(roomId).populate("members", "_id fullName profilePic");
    io.to(roomId).emit("room-members-updated", room ? room.members : []);
  });

  // Leave a room
  socket.on("leave-room", async (roomId) => {
    if (roomSocketMap[roomId]) roomSocketMap[roomId].delete(socket.id);
    socket.leave(roomId);
    // Fetch members from DB and emit
    const { default: ChatRoom } = await import("../models/chatRoom.model.js");
    const room = await ChatRoom.findById(roomId).populate("members", "_id fullName profilePic");
    io.to(roomId).emit("room-members-updated", room ? room.members : []);
  });

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    // Remove from all rooms
    for (const roomId in roomSocketMap) {
      roomSocketMap[roomId].delete(socket.id);
      // Optionally emit updated members
      const { default: ChatRoom } = await import("../models/chatRoom.model.js");
      const room = await ChatRoom.findById(roomId).populate("members", "_id fullName profilePic");
      io.to(roomId).emit("room-members-updated", room ? room.members : []);
    }
  });
});

export { io, app, server };
