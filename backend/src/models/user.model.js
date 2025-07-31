
// user.model.js
// Defines the User schema and model for MongoDB.
//
// Used in:
//   - Phase 1: Database setup and user storage
//   - Phase 2: Authentication (registration, login, password storage)
//
// Fields:
//   - email: unique user email (String)
//   - fullName: user's full name (String)
//   - password: hashed password (String)
//   - profilePic: optional profile picture URL (String)
//
// This model is used by authentication controllers and middleware.
import mongoose from "mongoose";


// Define the schema for user documents
const userSchema = new mongoose.Schema(
  {
    // User's email address (must be unique, required for login)
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // User's full name (required for registration)
    fullName: {
      type: String,
      required: true,
    },
    // Unique username (required for friend requests, login, etc.)
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 32,
      match: /^[a-zA-Z0-9_]+$/,
      trim: true,
    },
    // Hashed password (required for authentication, min 6 chars, optional for Google users)
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    // Optional profile picture URL (can be empty)
    profilePic: {
      type: String,
      default: "",
    },
    // Google account ID (for linked Google accounts)
    googleId: {
      type: String,
      default: null,
    },
    // Google email (for linked Google accounts)
    googleEmail: {
      type: String,
      default: null,
    },
    // Last message timestamp for DM sorting
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    // Unread message count per sender (senderId: count)
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    // Friends system
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    incomingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);


// Create the User model from the schema
const User = mongoose.model("User", userSchema);

// Export the User model for use in controllers and routes
export default User;
