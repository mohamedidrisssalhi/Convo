// cancelFriendRequest removed: users can no longer cancel sent requests
// ...existing code...
import User from "../models/user.model.js";

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  let { username } = req.body;
  const userId = req.user._id;
  if (!username) return res.status(400).json({ message: "Username required" });
  if (req.user.username === username || req.user.fullName === username) return res.status(400).json({ message: "Cannot friend yourself" });

  // Try to find by username, fallback to fullName (case-insensitive, trimmed)
  let target = await User.findOne({ username });
  if (!target) {
    target = await User.findOne({ fullName: { $regex: `^${username.trim()}$`, $options: 'i' } });
  }
  if (!target) return res.status(404).json({ message: "User not found" });
  if (target.friends.includes(userId)) return res.status(400).json({ message: "Already friends" });
  if (target.incomingRequests.includes(userId) || target.sentRequests.includes(userId)) return res.status(400).json({ message: "Request already sent or pending" });
  // Add to incoming/sent
  target.incomingRequests.push(userId);
  await target.save();
  req.user.sentRequests.push(target._id);
  await req.user.save();

  // Real-time: notify the recipient instantly via socket.io
  try {
    const { getReceiverSocketId } = await import("../lib/socket.js");
    const receiverSocketId = getReceiverSocketId(target._id.toString());
    if (receiverSocketId) {
      const io = (await import("../lib/socket.js")).io;
      io.to(receiverSocketId).emit("newFriendRequest", {
        _id: req.user._id,
        fullName: req.user.fullName,
        username: req.user.username,
        profilePic: req.user.profilePic || null
      });
    }
  } catch (err) {
    console.error("Socket emit error (newFriendRequest):", err);
  }

  res.json({ message: "Friend request sent" });
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  const { userId } = req.body;
  const me = await User.findById(req.user._id);
  const sender = await User.findById(userId);
  if (!sender) return res.status(404).json({ message: "User not found" });
  // Remove from requests
  me.incomingRequests = me.incomingRequests.filter(id => id.toString() !== userId);
  sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== me._id.toString());
  // Add to friends
  me.friends.push(sender._id);
  sender.friends.push(me._id);
  await me.save();
  await sender.save();

  // Real-time: notify both users to update their friends list instantly
  try {
    const { getReceiverSocketId } = await import("../lib/socket.js");
    const io = (await import("../lib/socket.js")).io;
    // Notify the sender (the one who sent the request)
    const senderSocketId = getReceiverSocketId(sender._id.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendsListUpdated");
    }
    // Notify the accepter (the one who accepted)
    const meSocketId = getReceiverSocketId(me._id.toString());
    if (meSocketId) {
      io.to(meSocketId).emit("friendsListUpdated");
    }
  } catch (err) {
    console.error("Socket emit error (friendsListUpdated):", err);
  }
  res.json({ message: "Friend request accepted" });
};

// Reject a friend request
export const rejectFriendRequest = async (req, res) => {
  const { userId } = req.body;
  const me = await User.findById(req.user._id);
  const sender = await User.findById(userId);
  if (!sender) return res.status(404).json({ message: "User not found" });
  // Remove from requests
  me.incomingRequests = me.incomingRequests.filter(id => id.toString() !== userId);
  sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== me._id.toString());
  await me.save();
  await sender.save();
  res.json({ message: "Friend request rejected" });
};

// List all friends
export const getFriends = async (req, res) => {
  const me = await User.findById(req.user._id).populate("friends", "_id fullName username profilePic");
  res.json(me.friends);
};

// List incoming requests
export const getIncomingRequests = async (req, res) => {
  const me = await User.findById(req.user._id).populate("incomingRequests", "_id fullName username profilePic");
  res.json(me.incomingRequests);
};

// List sent requests
export const getSentRequests = async (req, res) => {
  const me = await User.findById(req.user._id).populate("sentRequests", "_id fullName username profilePic");
  res.json(me.sentRequests);
};

// Remove a friend
export const removeFriend = async (req, res) => {
  const { id } = req.params;
  const me = await User.findById(req.user._id);
  const friend = await User.findById(id);
  if (!friend) return res.status(404).json({ message: "User not found" });
  me.friends = me.friends.filter(fid => fid.toString() !== id);
  friend.friends = friend.friends.filter(fid => fid.toString() !== me._id.toString());
  await me.save();
  await friend.save();

  // Real-time: notify both users to update their friends list instantly
  try {
    const { getReceiverSocketId } = await import("../lib/socket.js");
    const io = (await import("../lib/socket.js")).io;
    // Notify the user who initiated the unfriend
    const meSocketId = getReceiverSocketId(me._id.toString());
    if (meSocketId) {
      io.to(meSocketId).emit("friendsListUpdated");
    }
    // Notify the user who was unfriended
    const friendSocketId = getReceiverSocketId(friend._id.toString());
    if (friendSocketId) {
      io.to(friendSocketId).emit("friendsListUpdated");
    }
  } catch (err) {
    console.error("Socket emit error (friendsListUpdated - unfriend):", err);
  }
  res.json({ message: "Friend removed" });
};
