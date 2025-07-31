
// chatRoom.model.js
// Defines the ChatRoom schema and model for MongoDB.
//
// Phase 3: Used for chat room creation, membership, and management.
//
// Fields:
//   - name: unique room name (String)
//   - members: array of User IDs (ObjectId)
//   - avatar: optional room avatar (String)
//   - createdAt: room creation date (Date)
//
// This model is used by chat room controllers and routes.
import mongoose from 'mongoose';

const ChatRoomSchema = new mongoose.Schema({
  // Room name (must be unique)
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Array of user IDs who are members of the room
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Optional avatar image URL for the room
  avatar: {
    type: String,
    default: ''
  },
  // Last message timestamp for sorting
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  // Unread message count per user (userId: count)
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  },
  // Room creation date
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);
export default ChatRoom;
