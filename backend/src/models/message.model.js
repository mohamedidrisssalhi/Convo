
// message.model.js
// Defines the Message schema and model for MongoDB.
//
// Used in:
//   - Phase 1: Database setup and message storage
//   - Phase 4: Real-time messaging and message history
//
// Fields:
//   - senderId: user who sent the message (ObjectId)
//   - receiverId: user who receives the message (ObjectId, optional)
//   - roomId: chat room for the message (ObjectId, optional)
//   - text: message text (String)
//   - image: optional image URL (String)
//
// This model is used by message controllers and Socket.IO logic.
import mongoose from "mongoose";


// Define the schema for message documents
const messageSchema = new mongoose.Schema(
  {
    // Sender's user ID (required)
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Receiver's user ID (optional, for 1-1 messages)
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Only for 1-1 messages
    },
    // Chat room ID (optional, for room messages)
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: false, // Only for room messages
    },
    // Message text content
    text: {
      type: String,
    },
    // Optional image URL
    image: {
      type: String,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);


// Create the Message model from the schema
const Message = mongoose.model("Message", messageSchema);

// Export the Message model for use in controllers and routes
export default Message;
