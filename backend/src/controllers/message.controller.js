import ChatRoom from "../models/chatRoom.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Get messages for a chat room
const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    if (!room.members.includes(req.user._id)) return res.status(403).json({ error: "Not a member of this room" });
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    // Reset unread count for this user in this room
    if (room && room.unreadCounts) {
      room.unreadCounts.set(req.user._id.toString(), 0);
      await room.save();
      // Emit sidebar update to self so badge disappears instantly (Messenger-style)
      const mySocketId = getReceiverSocketId(req.user._id.toString());
      if (mySocketId) {
        io.to(mySocketId).emit("sidebarUpdate");
      }
    }
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a message to a chat room
const sendRoomMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    if (!room.members.includes(senderId)) return res.status(403).json({ error: "Not a member of this room" });
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      roomId,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    // Update lastMessageAt and unreadCounts
    room.lastMessageAt = new Date();
    room.members.forEach((memberId) => {
      if (memberId.toString() !== senderId.toString()) {
        // Increment unread count for each recipient
        const prev = room.unreadCounts.get(memberId.toString()) || 0;
        room.unreadCounts.set(memberId.toString(), prev + 1);
        const socketId = getReceiverSocketId(memberId.toString());
        if (socketId) {
          io.to(socketId).emit("newMessage", newMessage);
          // Emit sidebar update to recipient
          io.to(socketId).emit("sidebarUpdate");
        }
      }
    });
    // Also emit sidebar update to sender
    const senderSocketId = getReceiverSocketId(senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("sidebarUpdate");
    }
    await room.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get users for sidebar
// Get users for sidebar, including DM metadata (lastMessageAt, unreadCounts from logged-in user's perspective)
const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id.toString();
    // Get all users except self
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    // For each user, get lastMessageAt and unreadCounts for this DM
    const result = await Promise.all(users.map(async (user) => {
      // Find the latest message between loggedInUser and this user
      const lastMsg = await Message.findOne({
        $or: [
          { senderId: loggedInUserId, receiverId: user._id },
          { senderId: user._id, receiverId: loggedInUserId },
        ],
      }).sort({ createdAt: -1 });
      // Get unread count for this DM (from logged-in user's unreadCounts)
      const me = await User.findById(loggedInUserId);
      let unreadCount = 0;
      if (me && me.unreadCounts && me.unreadCounts.get(user._id.toString())) {
        unreadCount = me.unreadCounts.get(user._id.toString());
      }
      return {
        ...user.toObject(),
        lastMessageAt: lastMsg ? lastMsg.createdAt : null,
        unreadCount,
      };
    }));
    // Sort by lastMessageAt desc
    result.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages for user-to-user chat
const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    // Reset unread count for this DM
    const me = await User.findById(myId);
    if (me && me.unreadCounts) {
      me.unreadCounts.set(userToChatId, 0);
      await me.save();
      // Emit sidebar update to self so badge disappears instantly
      const mySocketId = getReceiverSocketId(myId.toString());
      if (mySocketId) {
        io.to(mySocketId).emit("sidebarUpdate");
      }
    }
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a user-to-user message
const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    // Update lastMessageAt and unreadCounts for both users
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (sender) sender.lastMessageAt = new Date();
    if (receiver) receiver.lastMessageAt = new Date();
    // Increment unread for receiver
    if (receiver) {
      const prev = receiver.unreadCounts.get(senderId.toString()) || 0;
      receiver.unreadCounts.set(senderId.toString(), prev + 1);
      await receiver.save();
    }
    if (sender) await sender.save();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      io.to(receiverSocketId).emit("sidebarUpdate");
    }
    // Also emit sidebar update to sender
    const senderSocketId = getReceiverSocketId(senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("sidebarUpdate");
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  getRoomMessages,
  sendRoomMessage,
  getUsersForSidebar,
  getMessages,
  sendMessage,
};
