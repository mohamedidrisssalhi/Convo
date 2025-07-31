
// chatRoom.controller.js
// Handles chat room creation, retrieval, joining, and leaving logic.
//
// Used in:
//   - Phase 3: Chat room creation and listing
//   - Phase 4: Real-time messaging in rooms
//
// Exports controller functions for use in chatRoom.route.js.

import ChatRoom from '../models/chatRoom.model.js';
import User from '../models/user.model.js';

// Controller to create a new chat room
// - Validates input, checks for duplicate room, and creates the room document
const createRoom = async (req, res) => {
  try {
    let { name, members, avatar } = req.body;
    // Validate room name
    if (!name || typeof name !== 'string') return res.status(400).json({ message: 'Room name is required' });
    // If no members provided, default to current user
    if (!Array.isArray(members) || members.length === 0) members = [req.user._id];
    // Remove duplicate member IDs
    members = [...new Set(members.map(String))];
    // Validate avatar (optional)
    if (avatar && typeof avatar !== 'string') avatar = '';
    // Check if a room with the same name exists
    const existing = await ChatRoom.findOne({ name });
    if (existing) return res.status(409).json({ message: 'Room already exists' });
    // Create the chat room
    const room = await ChatRoom.create({ name, members, avatar: avatar || '' });
    // Respond with the created room
    res.status(201).json(room);
  } catch (err) {
    // Handle server errors
    res.status(500).json({ message: err.message });
  }
};

// Controller to list all chat rooms
// - Populates member usernames for each room
const getRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find().populate('members', 'username');
    // Respond with the list of rooms
    res.json(rooms);
  } catch (err) {
    // Handle server errors
    res.status(500).json({ message: err.message });
  }
};

// Controller to join a chat room
// - Adds the current user to the room's members if not already present
const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    // Add user if not already a member
    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }
    // Respond with the updated room
    res.json(room);
  } catch (err) {
    // Handle server errors
    res.status(500).json({ message: err.message });
  }
};

// Controller to leave a chat room
// - Removes the current user from the room's members array
const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    // Remove user from members
    room.members = room.members.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );
    await room.save();
    // Emit updated members to the room for real-time sync
    const { getIO } = await import("../lib/socket.js");
    const io = getIO();
    const populatedRoom = await room.populate("members", "_id fullName profilePic");
    io.to(roomId).emit("room-members-updated", populatedRoom.members);
    // Respond with confirmation
    res.json({ message: 'Left room' });
  } catch (err) {
    // Handle server errors
    res.status(500).json({ message: err.message });
  }
};


// Export all chat room controller functions for use in routes
export default {
  createRoom,
  getRooms,
  joinRoom,
  leaveRoom,
};
